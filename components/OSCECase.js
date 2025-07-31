
import React, { useState, useEffect } from 'react';

const patientPrompt = `You are roleplaying a patient in an AMC Clinical OSCE. Stay in character.

Patient name: John Smith
Age: 54
Chief complaint: Chest pain
History: Started 1 hour ago, dull pain, radiates to left arm, nausea, sweaty. Smoker. Diabetic.
Emotional state: Anxious, worried it's serious.

Only respond as the patient would. Answer only what's asked. Don’t give away diagnosis unless the candidate asks.

Once the candidate finishes, respond: "Thank you, doctor."`;

export default function OSCECase() {
  const [readingTime, setReadingTime] = useState(120);
  const [interactionTime, setInteractionTime] = useState(480);
  const [stage, setStage] = useState('reading');
  const [messages, setMessages] = useState([
    { role: 'system', content: patientPrompt },
    { role: 'assistant', content: 'Hello doctor, I’m not feeling well. I’ve been having some chest pain.' }
  ]);
  const [input, setInput] = useState('');

  useEffect(() => {
    let timer;
    if (stage === 'reading' && readingTime > 0) {
      timer = setTimeout(() => setReadingTime(readingTime - 1), 1000);
    } else if (stage === 'reading' && readingTime === 0) {
      setStage('active');
    } else if (stage === 'active' && interactionTime > 0) {
      timer = setTimeout(() => setInteractionTime(interactionTime - 1), 1000);
    } else if (stage === 'active' && interactionTime === 0) {
      setStage('finished');
    }
    return () => clearTimeout(timer);
  }, [readingTime, interactionTime, stage]);

  export default async function handler(req, res) {
  const { messages } = req.body;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
    }),
  });

  const json = await response.json();
  const reply = json.choices?.[0]?.message?.content || "Sorry, I didn't understand that.";
  res.status(200).json({ reply });
}


  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>AMC OSCE Case Simulation</h1>

      {stage === 'reading' && (
        <div style={{ border: '1px solid #ccc', padding: '16px', marginTop: '10px' }}>
          <p><strong>Reading Time: {readingTime}s</strong></p>
          <p><strong>Scenario:</strong> You are in a GP clinic. A 54-year-old man presents with chest pain. Take history and counsel the patient.</p>
        </div>
      )}

      {stage === 'active' && (
        <div style={{ marginTop: '20px' }}>
          <p><strong>Time Remaining: {interactionTime}s</strong></p>
          <div style={{ height: '200px', overflowY: 'auto', border: '1px solid #ddd', padding: '8px', marginBottom: '12px' }}>
            {messages.map((msg, idx) => (
              <p key={idx}><strong>{msg.role === 'user' ? 'You' : 'Patient'}:</strong> {msg.content}</p>
            ))}
          </div>
          <textarea
            placeholder="Type your response..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
          />
          <button onClick={handleSubmit}>Send</button>
        </div>
      )}

      {stage === 'finished' && (
        <div style={{ border: '1px solid #ccc', padding: '16px', marginTop: '10px' }}>
          <h2>Case Finished</h2>
          <p>Thank you for completing the simulation.</p>
          <p>
            ✅ <strong>History:</strong> Chest pain, radiation, risk factors<br/>
            ⚠️ <strong>Communication:</strong> Did not clearly reassure the patient<br/>
            ✅ <strong>Safety:</strong> Recommended emergency transfer
          </p>
        </div>
      )}
    </div>
  );
}
