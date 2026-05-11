import React, { useState, useEffect } from "react";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { clearUserInfo, ensureAdminSession, loginAdmin } from "../../../services/auth.service";

function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    let isMounted = true;

    ensureAdminSession()
      .then((allowed) => {
        if (!isMounted) {
          return;
        }

        if (allowed) {
          navigate("/", { replace: true });
          return;
        }

        setIsCheckingSession(false);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }
        setIsCheckingSession(false);
      });

    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    
    if (rememberMe && savedEmail && savedPassword) {
      setFormData({
        email: savedEmail,
        password: savedPassword
      });
      setIsChecked(true);
    }

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleCheckboxChange = (event) => {
    const checked = event.target.checked;
    setIsChecked(checked);
    
    if (checked) {
      localStorage.setItem('rememberedEmail', formData.email);
      localStorage.setItem('rememberedPassword', formData.password);
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberedPassword');
      localStorage.removeItem('rememberMe');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (isChecked) {
      localStorage.setItem(`remembered${name.charAt(0).toUpperCase() + name.slice(1)}`, value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      clearUserInfo();
      await loginAdmin({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Login failed:", err);
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex items-center justify-center p-5">
      <div className="container mx-auto">
        <div className="flex  justify-center items-center">
          <div className="w-full lg:w-1/2 bg-white p-5 md:px-18 md:py-28 shadow-[0px_10px_30px_rgba(0,0,0,0.1)] rounded-2xl">
            {isCheckingSession ? (
              <div className="py-12 text-center text-lg font-semibold text-blue-600">
                Checking admin session...
              </div>
            ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="w-full">
                <label className="text-xl text-blue-600 mb-2 font-bold">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="enter your gmail"
                  className="w-full px-5 py-3 border-2 border-blue-600 rounded-md outline-none mt-5 placeholder:text-xl"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="w-full">
                <label className="text-xl text-blue-600 mb-2 font-bold">
                  Password
                </label>
                <div className="w-full relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="**********"
                    className="w-full border-2 border-blue-600 rounded-md outline-none px-5 py-3 mt-5 placeholder:text-xl"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 bottom-4 flex items-center text-blue-600"
                  >
                    {showPassword ? (
                      <IoEyeOffOutline className="w-5 h-5" />
                    ) : (
                      <IoEyeOutline className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm my-5">
                <label className="flex items-center gap-[10px] cursor-pointer">
                  <input
                    type="checkbox"
                    className="hidden"
                    onChange={handleCheckboxChange}
                  />
                  {isChecked ? (
                    <svg
                      width="21"
                      height="21"
                      viewBox="0 0 21 21"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g id="Group 335">
                        <rect
                          id="Rectangle 331"
                          x="-0.00012207"
                          y="6.10352e-05"
                          width="21"
                          height="21"
                          rx="4"
                          className="fill-blue-600"
                          stroke="#962ebf"
                        ></rect>
                        <path
                          id="Vector"
                          d="M8.19594 15.4948C8.0646 15.4949 7.93453 15.4681 7.81319 15.4157C7.69186 15.3633 7.58167 15.2865 7.48894 15.1896L4.28874 11.8566C4.10298 11.6609 3.99914 11.3965 3.99988 11.1213C4.00063 10.8461 4.10591 10.5824 4.29272 10.3878C4.47953 10.1932 4.73269 10.0835 4.99689 10.0827C5.26109 10.0819 5.51485 10.1901 5.70274 10.3836L8.19591 12.9801L14.2887 6.6335C14.4767 6.4402 14.7304 6.3322 14.9945 6.33307C15.2586 6.33395 15.5116 6.44362 15.6983 6.63815C15.8851 6.83268 15.9903 7.09627 15.9912 7.37137C15.992 7.64647 15.8883 7.91073 15.7027 8.10648L8.90294 15.1896C8.8102 15.2865 8.7 15.3633 8.57867 15.4157C8.45734 15.4681 8.32727 15.4949 8.19594 15.4948Z"
                          fill="white"
                        ></path>
                      </g>
                    </svg>
                  ) : (
                    <svg
                      width="21"
                      height="21"
                      viewBox="0 0 21 21"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g id="Group 335">
                        <rect
                          id="Rectangle 331"
                          x="-0.00012207"
                          y="6.10352e-05"
                          width="21"
                          height="21"
                          rx="4"
                          className="fill-transparent"
                          stroke="#962ebf"
                        ></rect>
                      </g>
                    </svg>
                  )}

                  <span className="text-xl text-[#424242]">
                    Remember Password
                  </span>
                </label>
                <Link to="/forget-password" className="text-[#111827] text-xl">
                  Forgot Password?
                </Link>
              </div>
              <div className="flex justify-center items-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-1/3 bg-blue-600 text-white font-bold py-3 rounded-lg shadow-lg cursor-pointer mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Logging In..." : "Log In"}
                </button>
              </div>
              {error && (
                <div className="text-red-500 text-center mt-2">
                  {error}
                </div>
              )}
            </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;
