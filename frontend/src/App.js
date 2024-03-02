import './App.css';
import PvP from './views/PvP/PvP';
import Home from './views/Home/Home';
import Vanilla from './views/Vanilla/Vanilla';
import PvC from './views/PvC/PvC';
import { Routes, Route } from 'react-router-dom';
// import { Button } from 'antd';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Home></Home>}></Route>
        <Route path='/pvp' element={<PvP></PvP>}></Route>
        <Route path='/vanilla' element={<Vanilla></Vanilla>}></Route>
        <Route path='/pvc' element={<PvC></PvC>}></Route>
      </Routes>
    </div>
  );
}


export default App;
