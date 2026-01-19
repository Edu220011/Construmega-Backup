// Leitura de código de barras usando QuaggaJS (pronto para integrar em qualquer componente React)
// Instale a dependência: npm install quagga
// Exemplo de uso: importar BarcodeReader e renderizar <BarcodeReader onDetected={codigo => ...} />

import React, { useEffect } from 'react';
import Quagga from 'quagga';

function BarcodeReader({ onDetected }) {
  useEffect(() => {
    Quagga.init({
      inputStream: {
        name: 'Live',
        type: 'LiveStream',
        target: document.querySelector('#barcode-camera'),
        constraints: { facingMode: 'environment' }
      },
      decoder: { readers: ['ean_reader', 'code_128_reader', 'upc_reader'] },
      locate: true
    }, err => {
      if (!err) Quagga.start();
    });
    Quagga.onDetected(data => {
      if (onDetected) onDetected(data.codeResult.code);
      Quagga.stop();
    });
    return () => { Quagga.stop(); Quagga.offDetected(); };
  }, [onDetected]);

  return (
    <div>
      <div id="barcode-camera" style={{width: '100%', height: 320, background: '#222'}}></div>
      <p style={{textAlign:'center',color:'#2d3a4b',marginTop:12}}>Aponte a câmera para o código de barras</p>
    </div>
  );
}

export default BarcodeReader;
