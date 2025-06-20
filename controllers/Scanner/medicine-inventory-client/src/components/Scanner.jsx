import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import axios from "axios";

const Scanner = () => {
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const [groupCode, setGroupCode] = useState("");
  const [scannerStarted, setScannerStarted] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("");
  const [scanLocked, setScanLocked] = useState(false);

  const fetchMedicines = async (code) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/groups/${code}/medicines`);
      setMedicines(res.data);
    } catch (err) {
      console.error(err);
      setStatus("Error fetching medicines.");
    }
  };

  useEffect(() => {
    const scannerId = "reader";
    const html5QrCode = new Html5Qrcode(scannerId);
    html5QrCodeRef.current = html5QrCode;

    html5QrCode
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: 250,
          formatsToSupport: [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
          ],
        },
        async (decodedText) => {
          if (!scanLocked) {
            setScanLocked(true); // lock scanning
            try {
              await html5QrCode.stop();
              await html5QrCode.clear();
            } catch (e) {
              console.warn("Scanner already stopped or not running.");
            }
            setGroupCode(decodedText);
            fetchMedicines(decodedText);
          }
        },
        (error) => {
          // silent decoding errors
        }
      )
      .then(() => setScannerStarted(true))
      .catch((err) => {
        console.error("Camera init failed", err);
        setStatus("Failed to start scanner.");
      });

    return () => {
      if (html5QrCodeRef.current && scannerStarted) {
        html5QrCodeRef.current
          .stop()
          .then(() => html5QrCodeRef.current.clear())
          .catch((err) => console.warn("Cleanup error", err));
      }
    };
  }, []);

  const updateStock = async () => {
    if (!selectedMedicine || quantity <= 0) return;

    try {
      await axios.patch(`http://localhost:5000/api/medicines/${selectedMedicine}/update-stock`, {
        quantity,
      });
      setStatus("✅ Stock updated!");

      // Optional: reset page after update
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to update stock.");
    }
  };

  return (
    <div>
      <h2>Scan Barcode</h2>
      <div id="reader" style={{ width: "300px", marginBottom: "20px" }}></div>

      {groupCode && (
        <div>
          <h3>Scanned Group: {groupCode}</h3>
          <select onChange={(e) => setSelectedMedicine(e.target.value)}>
            <option value="">-- Select Medicine --</option>
            {medicines.map((med) => (
              <option key={med.id} value={med.id}>
                {med.name} | Batch: {med.batch} | Stock: {med.stock}
              </option>
            ))}
          </select>
          <br />
          <label>Quantity:</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <br />
          <button onClick={updateStock}>Update Stock</button>
          <p>{status}</p>
        </div>
      )}
    </div>
  );
};

export default Scanner;
