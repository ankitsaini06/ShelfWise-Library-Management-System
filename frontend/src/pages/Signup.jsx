import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../shared/AuthContext";
import { signupStyles as s } from "../dummyStyles";
import {
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  BadgeCheck,
  Sparkles,
} from "lucide-react";

const stepList = [
  { id: 1, title: "Account" },
  { id: 2, title: "OTP" },
  { id: 3, title: "Profile" },
];

const signupHighlights = [
  "Step 1 collects student account details and checks immediately if the email already exists.",
  "Step 2 verifies the OTP before moving forward.",
  "Step 3 saves department, stream, semester, year, and roll number.",
];

const demoOtp = "2468";

const Signup = () => {
  const {
    registerStudent,
    verifyOtpCode,
    completeProfileData,
    logout,
  } = useAuth();

  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    otp: "",
    role: "user",
    department: "",
    stream: "",
    semester: "Semester 1",
    academicYear: "1st Year",
    rollNumber: "",
  });

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 2600);

    return () => clearTimeout(timer);
  }, [toast]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setError("");

    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);

      setForm((current) => ({
        ...current,
        [name]: digitsOnly,
      }));
    } else {
      setForm((current) => ({
        ...current,
        [name]: value,
      }));
    }
  };

  const validateStepOne = () => {
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.password.trim()
    ) {
      setError(
        "Please fill name, email, mobile number and password."
      );
      return false;
    }

    if (form.phone.length !== 10) {
      setError("Mobile number must contain 10 digits.");
      return false;
    }

    return true;
  };

  const validateStepThree = () => {
    if (
      !form.department.trim() ||
      !form.stream.trim() ||
      !form.semester.trim() ||
      !form.academicYear.trim() ||
      !form.rollNumber.trim()
    ) {
      setError("Please complete your profile.");
      return false;
    }

    return true;
  };

  const showToast = (message, tone = "success") => {
    setToast({ message, tone });
  };

  const goNext = async () => {
    setError("");

    if (step === 1) {
      if (!validateStepOne()) return;

      setLoading(true);

      const res = await registerStudent({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });

      setLoading(false);

      if (!res.ok) {
        showToast(res.error, "error");
        setError(res.error);
        return;
      }

      showToast("OTP sent successfully.");
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!form.otp.trim()) {
        setError("Please enter OTP.");
        return;
      }

      setLoading(true);

      const res = await verifyOtpCode({
        email: form.email,
        otp: form.otp,
      });

      setLoading(false);

      if (!res.ok) {
        showToast(res.error, "error");
        setError(res.error);
        return;
      }

      showToast("OTP verified successfully.");
      setStep(3);
    }
  };

  const goBack = () => {
    setError("");
    setStep((current) => Math.max(1, current - 1));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (
      !validateStepOne() ||
      !form.otp.trim() ||
      !validateStepThree()
    ) {
      setError("Please complete all steps.");
      return;
    }

    setLoading(true);

    const result = await completeProfileData({
      email: form.email,
      department: form.department,
      stream: form.stream,
      semester: form.semester,
      academicYear: form.academicYear,
      rollNumber: form.rollNumber,
    });

    setLoading(false);

    if (!result.ok) {
      showToast(result.error, "error");
      setError(result.error);
      return;
    }

    showToast("Account created successfully.");

    setTimeout(() => {
      logout();

      navigate("/login", {
        replace: true,
        state: {
          signupEmail: form.email,
          signupPassword: form.password,
        },
      });
    }, 900);
  };

  return (
    <div className={s.pageContainer}>
  {toast && (
    <div
      className={`${s.toastBase} ${
        toast.tone === "error"
          ? s.toastError
          : s.toastSuccess
      }`}
    >
      <div className={s.toastContent}>
        <CheckCircle2 size={18} />
        <span>{toast.message}</span>
      </div>
    </div>
  )}

  <div className={s.mainCard}>
    {/* Left Panel */}
    <section className={s.infoPanel}>
      <span className={s.infoBadge}>
        Student Registration
      </span>

      <h1 className={s.infoTitle}>
        Join Your
        <br />
        Library
      </h1>

      <div className={s.infoList}>
        {signupHighlights.map((item, index) => (
          <div
            key={index}
            className={s.infoListItem}
          >
            <CheckCircle2
              size={18}
              className={s.infoIcon}
            />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </section>

    {/* Right Panel */}
    <section className={s.formPanel}>
      <div className={s.formInner}>
        <Link
          to="/"
          className={s.backLink}
        >
          Back to Home
        </Link>

        <h2 className={s.panelTitle}>
          Create Account
        </h2>

        <p className={s.panelSubtitle}>
          Complete all three steps to register
          your library account.
        </p>

        <div className={s.stepGrid}>
          {stepList.map((item) => (
            <div
              key={item.id}
              className={`${s.stepCard} ${
                step >= item.id
                  ? s.stepCardCompleted
                  : s.stepCardPending
              }`}
            >
              <p className={s.stepLabel}>
                Step {item.id}
              </p>

              <p className={s.stepTitle}>
                {item.title}
              </p>
            </div>
          ))}
        </div>

        <form
          className={s.form}
          onSubmit={handleSubmit}
        >
          {step === 1 && (
            <>
              <label>
                <span className={s.fieldLabel}>
                  <UserRound size={15} />
                  Full Name
                </span>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={s.input}
                  placeholder="Enter full name"
                />
              </label>

              <label>
                <span className={s.fieldLabel}>
                  <Mail size={15} />
                  Email
                </span>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={s.input}
                  placeholder="student@gmail.com"
                />
              </label>

              <label>
                <span className={s.fieldLabel}>
                  Mobile Number
                </span>

                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className={s.input}
                  placeholder="9876543210"
                />
              </label>

              <label>
                <span className={s.fieldLabel}>
                  <LockKeyhole size={15} />
                  Password
                </span>

                <div className={s.passwordWrapper}>
                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className={s.passwordInput}
                    placeholder="Enter Password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    className={s.toggleButton}
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </label>
            </>
          )}

          {step === 2 && (
            <>
              <div className={s.otpInfoBox}>
                <p className={s.otpInfoLabel}>
                  Verify your Email
                </p>

                <p className={s.otpInfoText}>
                  Enter the OTP sent to
                  <span className={s.emailHighlight}>
                    {" "}
                    {form.email}
                  </span>
                </p>
              </div>

              <label>
                <span className={s.fieldLabelBlock}>
                  OTP
                </span>

                <input
                  type="text"
                  name="otp"
                  value={form.otp}
                  onChange={handleChange}
                  placeholder="Enter OTP"
                  className={s.input}
                />
              </label>

              {error && (
                <div className={s.errorMessage}>
                  {error}
                </div>
              )}

            </>
          )}

          {step === 3 && (
            <>
              <div className={s.twoColumnGrid}>
                <label>
                  <span className={s.fieldLabelBlock}>
                    Department
                  </span>

                  <input
                    type="text"
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    className={s.input}
                    placeholder="Department"
                  />
                </label>

                <label>
                  <span className={s.fieldLabelBlock}>
                    Stream
                  </span>

                  <input
                    type="text"
                    name="stream"
                    value={form.stream}
                    onChange={handleChange}
                    className={s.input}
                    placeholder="Stream"
                  />
                </label>
              </div>

              <div className={s.twoColumnGrid}>
                <label>
                  <span className={s.fieldLabelBlock}>
                    Semester
                  </span>

                  <select
                    name="semester"
                    value={form.semester}
                    onChange={handleChange}
                    className={s.select}
                  >
                    <option>Semester 1</option>
                    <option>Semester 2</option>
                    <option>Semester 3</option>
                    <option>Semester 4</option>
                    <option>Semester 5</option>
                    <option>Semester 6</option>
                    <option>Semester 7</option>
                    <option>Semester 8</option>
                  </select>
                </label>

                <label>
                  <span className={s.fieldLabelBlock}>
                    Academic Year
                  </span>

                  <select
                    name="academicYear"
                    value={form.academicYear}
                    onChange={handleChange}
                    className={s.select}
                  >
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                  </select>
                </label>
              </div>
                            <label>
                <span className={s.fieldLabelBlock}>
                  Roll Number
                </span>

                <input
                  type="text"
                  name="rollNumber"
                  value={form.rollNumber}
                  onChange={handleChange}
                  className={s.input}
                  placeholder="Enter Roll Number"
                />
              </label>     
            </>
          )}
          {error && (
  <div className={s.errorMessage}>
    {error}
  </div>
)}

<div className={s.buttonGroup}>
  {step > 1 && (
    <button
      type="button"
      onClick={goBack}
      disabled={loading}
      className={s.backButton}
    >
      Back
    </button>
  )}

  {step < 3 ? (
    <button
      type="button"
      onClick={goNext}
      disabled={loading}
      className={s.nextButton}
    >
      {loading ? "Please Wait..." : "Continue"}
      {!loading && <ArrowRight size={15} />}
    </button>
  ) : (
    <button
      type="submit"
      disabled={loading}
      className={s.submitButton}
    >
      {loading
        ? "Completing Profile..."
        : "Complete Profile"}

      {!loading && <ArrowRight size={15} />}
    </button>
  )}
</div>
        </form>
      </div>
    </section>
  </div>
</div>
);
};

export default Signup;