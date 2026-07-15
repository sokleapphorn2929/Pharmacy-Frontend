import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import VerifyCode from "../pages/VerifyCode";
import Home from "../pages/Home";
import RootLayout from "../layout/RootLayout";

export default function Routing() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index path="/" element={<Login />} />
        <Route path="/register" element={<Register/>}/>
        <Route path="/register-code" element={<VerifyCode/>}/>
        <Route path="/home" element={<RootLayout/>}>
          <Route path="" element={<Home/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
