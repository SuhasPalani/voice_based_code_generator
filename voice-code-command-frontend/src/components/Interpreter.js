import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Play } from 'lucide-react';
import '../App.css';

export function Interpreter() {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('python');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [explanationLoading, setExplanationLoading] = useState(false);

  const runCode = async () => {
    try {
      setLoading(true);  // Show loading animation
      const response = await fetch('http://127.0.0.1:5000/run_code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language }),
      });
      const data = await response.json();
      setOutput(data.output);
      setLoading(false);  // Hide loading animation
    } catch (error) {
      setOutput('Error: ' + error.message);
      setLoading(false);  // Hide loading animation
    }
  };

  const explainCode = async () => {
    try {
      setExplanationLoading(true);  // Show loading animation
      const response = await fetch('http://127.0.0.1:5000/explain_code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      setExplanation(data.explanation);
      setExplanationLoading(false);  // Hide loading animation
    } catch (error) {
      setExplanation('Error: ' + error.message);
      setExplanationLoading(false);  // Hide loading animation
    }
  };

  return (
    <Card className="interpreter-card">
      <CardHeader>
        <CardTitle className="interpreter-title">Code Compiler</CardTitle>
      </CardHeader>
      <CardContent className="interpreter-content">
        <div className="language-selector">
          <label htmlFor="language-select">Select Language:</label>
          <select
            id="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="javascript">JavaScript</option>
          </select>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="code-input"
          placeholder={`Enter your ${language} code here...`}
        />
        <div className="button-container">
          <button onClick={runCode} className="run-button">
            <Play className="run-icon" />
            <span>Run Code</span>
          </button>
          <button onClick={explainCode} className="explain-button">
            <span>Explain Code</span>
          </button>
        </div>
        
        {loading && (
          <div className="loading-container">
            <span className="loading-text">Generating Output...</span>
            <div className="spinner"></div>
          </div>
        )}
        
        {explanationLoading && (
          <div className="loading-container">
            <span className="loading-text">Generating Explanation...</span>
            <div className="spinner"></div>
          </div>
        )}

        {output && (
          <div className="output-container fade-in">
            <h3 className="output-title">Output:</h3>
            <pre className="output-content">{output}</pre>
          </div>
        )}

        {explanation && (
          <div className="output-container fade-in">
            <h3 className="output-title">Explanation:</h3>
            <pre className="output-content">{explanation}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
