import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabase";

const TestModal = ({ currentTest, onClose, onTestComplete }) => {
  const [userAnswers, setUserAnswers] = useState({});
  const [testResult, setTestResult] = useState(null);
  const [testStats, setTestStats] = useState({
    totalAttempts: 0,
    successfulPasses: 0
  });

  const fetchTestStats = useCallback(async () => {
    if (!currentTest?.[0]?.article_id) return;

    const { data, error } = await supabase
      .from('test_statistics')
      .select('total_attempts, successful_passes')
      .eq('article_id', currentTest[0].article_id)
      .single();

    if (!error && data) {
      setTestStats({
        totalAttempts: data.total_attempts || 0,
        successfulPasses: data.successful_passes || 0
      });
    }
  }, [currentTest]);

  useEffect(() => {
    fetchTestStats();
  }, [fetchTestStats]);

  const handleTestSubmit = async () => {
    let correct = 0;
    const results = currentTest.map(question => {
      const isCorrect = userAnswers[question.id] === question.correct_answer;
      if (isCorrect) correct++;
      return {
        ...question,
        userAnswer: userAnswers[question.id],
        isCorrect
      };
    });

    const score = Math.round((correct / currentTest.length) * 100);
    setTestResult({ results, score });

    const { data: { user } } = await supabase.auth.getUser();
    
    // Update test statistics
    const isSuccessful = score >= 70;
    await supabase
      .from('test_statistics')
      .upsert({
        article_id: currentTest[0].article_id,
        total_attempts: testStats.totalAttempts + 1,
        successful_passes: isSuccessful ? testStats.successfulPasses + 1 : testStats.successfulPasses
      }, {
        onConflict: 'article_id'
      });

    // Update user progress
    await supabase
      .from("user_article_progress")
      .upsert({
        user_id: user.id,
        article_id: currentTest[0].article_id,
        test_passed: isSuccessful
      });
    
    onTestComplete();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="bg-background rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Тест по статье</h2>
            <div className="text-sm text-muted-foreground">
              <div>Всего попыток: {testStats.totalAttempts}</div>
              <div>Успешных прохождений: {testStats.successfulPasses}</div>
            </div>
          </div>
          
          {!testResult ? (
            <div className="space-y-6">
              {currentTest.map((question) => (
                <div key={question.id} className="mb-6">
                  <p className="font-medium mb-3">{question.question}</p>
                  <div className="space-y-2">
                    {Object.entries(question.options).map(([key, value]) => (
                      <label key={key} className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          checked={userAnswers[question.id] === key}
                          onChange={() => setUserAnswers({
                            ...userAnswers,
                            [question.id]: key
                          })}
                          className="h-4 w-4 text-primary focus:ring-primary"
                        />
                        <span>{value}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button
                onClick={handleTestSubmit}
                className="w-full py-3 rounded-lg bg-gradient text-primary hover:bg-gradient-to-r hover:from-blue-700 hover:to-indigo-700"
              >
                Проверить ответы
              </button>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-semibold mb-4">
                Ваш результат: {testResult.score}%
              </h3>
              <div className="space-y-6">
                {testResult.results.map((question, idx) => (
                  <div key={idx} className={`p-4 rounded-lg ${
                    question.isCorrect ? "bg-green-500/20" : "bg-red-500/20"
                  }`}>
                    <p className="font-medium">{question.question}</p>
                    <p className="mt-2">
                      Ваш ответ: {question.options[question.userAnswer]} -{" "}
                      {question.isCorrect ? "✓ Верно" : "✗ Неверно"}
                    </p>
                    {!question.isCorrect && (
                      <p className="mt-1">
                        Правильный ответ: {question.options[question.correct_answer]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={onClose}
                className="mt-6 w-full py-3 rounded-lg bg-gradient text-primary hover:bg-gradient-to-r hover:from-blue-700 hover:to-indigo-700"
              >
                Закрыть
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TestModal; 