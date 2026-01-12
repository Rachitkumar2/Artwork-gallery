import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './App.css';
import ArtworkTable from './components/ArtworkTable';

function App() {
  return (
    <div className="app-container">
      <ArtworkTable />
    </div>
  );
}

export default App;
