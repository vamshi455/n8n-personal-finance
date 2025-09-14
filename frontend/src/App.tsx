import React from 'react';

function App() {
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3001/api/upload/excel', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      console.log('Upload result:', result);
      alert('Upload successful! Check console for details.');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed!');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Personal Finance Agent</h1>
      <div style={{ marginTop: '20px' }}>
        <h3>Upload Excel Bank Statement</h3>
        <input 
          type="file" 
          accept=".xlsx,.xls" 
          onChange={handleFileUpload}
        />
        <p>Upload your bank statement Excel file to get started</p>
      </div>
    </div>
  );
}

export default App;
