import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
const Register = () => {
      const navigate = useNavigate();

   const [formdata,setformdata]=useState({
    name:"",
      email:"",
      password:""
    }); 
    const handelchange=(e)=>{
      setformdata({...formdata,[e.target.name]:e.target.value});
    }
    const handelsubmit = (e) => {
        e.preventDefault(); 
        fetch('http://localhost:3000/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formdata.name,
            email: formdata.email,
            password: formdata.password
          }),
        })
        .then(response => response.json())
        .then(data => {
          console.log('Success:', data);
          localStorage.setItem("userId", data.userId);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
        alert('Registration successful!');
        navigate('/chatbot'); 
    };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8  border p-6 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Register for AI Chatbot
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handelsubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                onChange={handelchange}
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm"
                placeholder="Full Name"
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                onChange={handelchange}
                pattern='^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                onChange={handelchange}
                minLength={6}
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 shadow-md"
            >
              Register
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/"
              className="text-indigo-600 hover:text-indigo-500 font-medium transition duration-200"
            >
              Already have an account? Login here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;