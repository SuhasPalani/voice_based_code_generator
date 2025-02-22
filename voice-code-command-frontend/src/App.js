import Recorder from "./components/Recorder";
import "./App.css";
import { Interpreter } from "./components/Interpreter";

function App() {
  return (
    <>
      <div>
        <h1>Voice Code Command</h1>
        <Recorder />
      </div>
      <div>
        <Interpreter />
      </div>
    </>
  );
}

export default App;
