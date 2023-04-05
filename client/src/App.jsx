import { EthProvider } from "./contexts/EthContext";
import Intro from "./components/Intro/";
import Setup from "./components/Setup";
import Demo from "./components/Demo";
import Footer from "./components/Footer";
import Storeguilhain from "./components/Storeguilhain";
import StackenDCA from "./components/StackenDCA";

function App() {
  return (
    <EthProvider>
      <div id="App">
        <div className="container">
          <StackenDCA />
        </div>
      </div>
    </EthProvider>
  );
}

export default App;
