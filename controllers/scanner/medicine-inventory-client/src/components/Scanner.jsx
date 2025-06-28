import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import axios from "axios";

const Scanner = () => {
  const SCANNER_ID = "reader"; // ✅ fixed ID
  const html5QrCodeRef = useRef(null);
  const scannerStarted = useRef(false);

  const [groupCode, setGroupCode] = useState("");
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
      setStatus("❌ Error fetching medicines.");
    }
  };

  useEffect(() => {
    const initScanner = async () => {
      const scannerElement = document.getElementById(SCANNER_ID);

      if (!scannerElement || html5QrCodeRef.current) return; // prevent double init

      const html5QrCode = new Html5Qrcode(SCANNER_ID);
      html5QrCodeRef.current = html5QrCode;

      try {
        await html5QrCode.start(
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
              setScanLocked(true);
              try {
                await html5QrCode.stop();
                await html5QrCode.clear();
                scannerStarted.current = false;
              } catch (e) {
                console.warn("Stop error:", e.message);
              }
              setGroupCode(decodedText);
              fetchMedicines(decodedText);
            }
          },
          () => {} // ignore scan errors
        );

        scannerStarted.current = true;
      } catch (err) {
        console.error("Scanner failed to start:", err);
        setStatus("❌ Failed to start scanner.");
      }
    };

    initScanner();

    return () => {
      if (scannerStarted.current && html5QrCodeRef.current) {
        html5QrCodeRef.current
          .stop()
          .then(() => html5QrCodeRef.current.clear())
          .catch((err) => console.warn("Cleanup error:", err));
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
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      setStatus("❌ Failed to update stock.");
    }
  };

  return (
    <div>
      <h2>Scan Barcode</h2>
      <div id={SCANNER_ID} style={{ width: "300px", marginBottom: "20px" }}></div>

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
