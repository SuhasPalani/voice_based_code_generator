import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Play } from 'lucide-react';
import '../App.css';

export function Interpreter() {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('python');

  const runCode = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/run_code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language }),
      });
      const data = await response.json();
      setOutput(data.output);
    } catch (error) {
      setOutput('Error: ' + error.message);
    }
  };

  return (
    <Card className="interpreter-card">
      <CardHeader>
        <CardTitle className="interpreter-title">Code Interpreter</CardTitle>
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
        <button onClick={runCode} className="run-button">
          <Play className="run-icon" />
          <span>Run Code</span>
        </button>
        {output && (
          <div className="output-container">
            <h3 className="output-title">Output:</h3>
            <pre className="output-content">{output}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
