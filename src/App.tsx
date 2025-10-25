import './App.css'
import { ChartWithInput } from './ChartWithInput';

function App() {

  return (
    <div style={{ padding: 20 }}>
      <h2>📊 Wykres z gradientem skali</h2>
      {/* <ChartWithGradient /> */}
      <ChartWithInput />
    </div>
  );
}

export default App
