import React from "react";
import ReactDOM from "react-dom/client";
import './index.css'

import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom"
import Root from "./components/Root/Root";
import Error from "./components/Error/Error";
import Home from "./components/Home/Home";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthProvider from "./AuthProvider/AuthProvider";
import PrivateRoute from "./AuthProvider/PrivateRoute";
import Login from "./components/Authentication/Login";
import Register from "./components/Authentication/Register";
import Chatbot from "./components/Chatbot/Chatbot.jsx";
import Board from "./components/Board/Board.jsx";
import BoardList from "./components/Board/BoardList.jsx";


const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root></Root>,
    errorElement: <Error></Error>,

    children: [
      {
        path: "/",
        element: <Home></Home>,
      },
      {
        path: "/login",
        element: <Login></Login>,
      },
      {
        path: "/register",
        element: <Register></Register>,
      },    
   
      {
        path: "/board",
        element:
          <PrivateRoute>
            <BoardList></BoardList>
          </PrivateRoute>,
      },
      {
        path: "/board/:roomId",
        element:
          <PrivateRoute>
            <Board></Board>
          </PrivateRoute>,
      },
      {
        path: "/chatbot",
        element:
          <PrivateRoute>
            <Chatbot></Chatbot>
          </PrivateRoute>,
      },

    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>

    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>

    </AuthProvider>

  </React.StrictMode>,
)