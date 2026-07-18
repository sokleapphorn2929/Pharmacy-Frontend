import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import VerifyCode from "../pages/VerifyCode";
import Home from "../pages/Home";
import RootLayout from "../layout/RootLayout";
import Cart from "../pages/Cart";
import Favourite from "../pages/Favourite";
import Profile from "../pages/Profile";
import ForgetPassword from "../pages/ForgetPassword";
import Order from "../pages/Order";
import AuthRouting from "./AuthRouting";

export default function Routing() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route
          path="/kh"
          element={
            <AuthRouting>
              <RootLayout />
            </AuthRouting>
          }
        >
          <Route path="home" element={<Home />} />
          <Route path="cart" element={<Cart />} />
          <Route path="favourites" element={<Favourite />} />
          <Route path="profile" element={<Profile />} />
          <Route path="orders" element={<Order />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
