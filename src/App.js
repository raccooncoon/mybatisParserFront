import './App.css';
import XmlListView from "./XmlListView";
import CssBaseline from '@mui/material/CssBaseline';
import {BrowserRouter, Route, Routes} from 'react-router-dom';


function App() {
    return (
        <BrowserRouter>
            <div className="App">
                <CssBaseline />
                <Routes>
                    <Route path="/" element={<XmlListView />} />
                    <Route path=":endPoint" element={<XmlListView />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
