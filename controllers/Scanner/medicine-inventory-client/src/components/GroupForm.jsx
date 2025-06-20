import React, { useState } from 'react';
import Barcode from 'react-barcode';
import axios from 'axios';

const GroupForm = () => {
  const [group, setGroup] = useState({ category: '', brand: '', dose: '' });
  const [medicines, setMedicines] = useState([{ name: '', batch: '', expiry: '', stock: 0 }]);
  const [groupCode, setGroupCode] = useState('');

  const handleGroupChange = (e) => {
    setGroup({ ...group, [e.target.name]: e.target.value });
  };

  const handleMedicineChange = (index, e) => {
    const updated = [...medicines];
    updated[index][e.target.name] = e.target.value;
    setMedicines(updated);
  };

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', batch: '', expiry: '', stock: 0 }]);
  };

  const generateGroupCode = () => {
    const code = `MD-${group.brand.toUpperCase()}-${group.dose.replace(/\s+/g, '')}`;
    setGroupCode(code);
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/groups', {
        ...group,
        group_code: groupCode,
        medicines
      });
      alert('Group and medicines saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Error saving data');
    }
  };

  return (
    <div>
      <h2>Create Medicine Group</h2>
      <input name="category" placeholder="Category" onChange={handleGroupChange} />
      <input name="brand" placeholder="Brand" onChange={handleGroupChange} />
      <input name="dose" placeholder="Dose (e.g., 500MG)" onChange={handleGroupChange} />
      <button onClick={generateGroupCode}>Generate Group Code</button>

      {groupCode && (
        <div>
          <p><strong>Group Code:</strong> {groupCode}</p>
          <Barcode value={groupCode} />
        </div>
      )}

      <h3>Medicines in this Group</h3>
      {medicines.map((med, idx) => (
        <div key={idx}>
          <input name="name" placeholder="Medicine Name" value={med.name} onChange={(e) => handleMedicineChange(idx, e)} />
          <input name="batch" placeholder="Batch No." value={med.batch} onChange={(e) => handleMedicineChange(idx, e)} />
          <input name="expiry" placeholder="Expiry (YYYY-MM)" value={med.expiry} onChange={(e) => handleMedicineChange(idx, e)} />
          <input name="stock" placeholder="Stock Qty" type="number" value={med.stock} onChange={(e) => handleMedicineChange(idx, e)} />
        </div>
      ))}
      <button onClick={addMedicine}>+ Add Another Medicine</button>
      <br /><br />
      <button onClick={handleSubmit}>Save Group</button>
    </div>
  );
};

export default GroupForm;

