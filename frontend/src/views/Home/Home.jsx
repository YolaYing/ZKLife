import './Home.css';
import { Button } from 'antd';

const Home = () => {
  return (
    <div>
      <img className="logo-img" src="./logo.png" alt="logo" />
      <div className="btn-box">
        <Button size="large" href="/vanilla">Vanilla</Button>
        <Button size="large" href="/pvp">PvP Game</Button>
        <Button size="large" href="/pvc">PvC Game</Button>
      </div>
    </div>
  );
}

export default Home;