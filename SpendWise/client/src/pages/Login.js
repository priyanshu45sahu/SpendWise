import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Checkbox } from 'antd';
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Spinner from '../components/Spinner';
import "../style/login.css";

const apiUrl ='https://spend-wise-xi.vercel.app';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const submitHandler = async (values) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${apiUrl}/users/login`, values);
      setLoading(false);
      message.success('Login successful');
      localStorage.setItem('user', JSON.stringify({ ...data.user, password: "" }));
      if (rememberMe) {
        localStorage.setItem('rememberMe', JSON.stringify(values));
      }
      navigate('/');
    } catch (error) {
      setLoading(false);
      message.error('Invalid username or password');
    }
  };

  useEffect(() => {
    if (localStorage.getItem("user")) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="login-page">
      {loading && <Spinner />}
      <Form layout="vertical" onFinish={submitHandler}>
        <h1>Login Form</h1>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please input your email!', type: 'email' }
          ]}
        >
          <Input type="email" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}>
            Remember Me
          </Checkbox>
        </Form.Item>

        <div className="d-flex justify-content-between align-items-center">
          <Link to="/register">Not a user? Click here to register</Link>
          <Button type="primary" htmlType="submit" className="login-button">
            Login
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default Login;
