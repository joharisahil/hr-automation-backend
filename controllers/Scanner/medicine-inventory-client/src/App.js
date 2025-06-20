import React from 'react';
import GroupForm from './components/GroupForm';
import Scanner from './components/Scanner';

function App() {
  return (
    <div className="App">
      <h1>Medicine Inventory</h1>
      <GroupForm />
      <hr />
      <Scanner />
    </div>
  );
}

export default App;
