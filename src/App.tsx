import './App.css'
import { ChartWithInput } from './ChartWithInput';

function App() {

  return (
    <div style={{ paddingLeft: 20, paddingRight: 20 }}>
      <h2>📊 Wykres z gradientem skali</h2>
      {/* <ChartWithGradient /> */}
      <ChartWithInput />
    </div>
  );
}

export default App
