import React, { useState } from 'react';
import { interviewService } from '../services/api.service';
import { useNavigate } from 'react-router-dom';

const InterviewGenerator = () => {
  const [skills, setSkills] = useState('');
  const [questionsPerSkill, setQuestionsPerSkill] = useState(3);
  const [difficulty, setDifficulty] = useState('intermediate');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const skillsArray = skills.split(',').map((s) => s.trim()).filter((s) => s);
      if (skillsArray.length === 0) {
        setError('Please enter at least one skill');
        setLoading(false);
        return;
      }

      const interview = await interviewService.generateInterview(
        skillsArray,
        questionsPerSkill,
        difficulty,
        context
      );

      navigate(`/interview/${interview.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Generate Interview</h2>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          View Evaluations
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>
            Skills (comma-separated):
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g., JavaScript, React, Node.js"
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>
            Questions per skill:
            <input
              type="number"
              value={questionsPerSkill}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value) && value >= 1 && value <= 10) {
                  setQuestionsPerSkill(value);
                }
              }}
              min="1"
              max="10"
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>
            Difficulty:
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>
            Context (optional):
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Additional context for the interview..."
              rows="3"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>
        {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Generating...' : 'Generate Interview'}
        </button>
      </form>
    </div>
  );
};

export default InterviewGenerator;

