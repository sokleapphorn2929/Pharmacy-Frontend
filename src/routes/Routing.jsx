import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import VerifyCode from "../pages/VerifyCode";
import Home from "../pages/Home";
import RootLayout from "../layout/RootLayout";
import Cart from "../pages/Cart";
import Favourite from "../pages/Favourite";

export default function Routing() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index path="/" element={<Login />} />
        <Route path="/register" element={<Register/>}/>
        <Route path="/verify-code" element={<VerifyCode/>}/>
        <Route path="/kh" element={<RootLayout/>}>
          <Route path="home" element={<Home/>}/>
          <Route path="cart" element={<Cart/>}/>
          <Route path="favourite" element={<Favourite/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
