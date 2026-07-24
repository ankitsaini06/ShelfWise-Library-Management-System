import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext();

const API_BASE_URL = "http://localhost:5000/api/auth";

const SESSION_KEY = "library_session";
const TOKEN_KEY = "library_token";

const defaultAccounts = [
  {
    id: "admin-1",
    name: "Library Admin",
    email: "admin@library.com",
    phone: "9999999999",
    password: "admin123",
    role: "admin",
    department: "Administration",
    stream: "Library",
    semester: "-",
    academicYear: "-",
    rollNumber: "ADMIN001",
  },
];

const mapUserToFrontend = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  department: user.department || "",
  stream: user.stream || "",
  semester: user.semester || "",
  academicYear: user.year || "",
  rollNumber: user.rollNo || "",
});

export const AuthProvider = ({ children }) => {
  const [ready, setReady] = useState(false);

  const [accounts, setAccounts] =
    useState(defaultAccounts);

  const [currentUser, setCurrentUser] =
    useState(null);

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);

    setCurrentUser(null);
  };

  const fetchRegisteredUsers = async (token) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (
          data.success &&
          Array.isArray(data.users)
        ) {
          const fetchedAccounts =
            data.users.map(mapUserToFrontend);

          setAccounts((current) => {
            const merged = [...fetchedAccounts];

            defaultAccounts.forEach(
              (account) => {
                const exists = merged.some(
                  (item) =>
                    item.email.toLowerCase() ===
                    account.email.toLowerCase()
                );

                if (!exists) {
                  merged.push(account);
                }
              }
            );

            return merged;
          });
        }
      }
    } catch (error) {
      console.error(
        "Error fetching users:",
        error
      );
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token =
        localStorage.getItem(TOKEN_KEY);

      const session =
        localStorage.getItem(SESSION_KEY);

      if (token && session) {
        try {
          const response = await fetch(
            `${API_BASE_URL}/me`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const data =
              await response.json();

            if (
              data.success &&
              data.user
            ) {
              const mappedUser =
                mapUserToFrontend(data.user);

              setCurrentUser(mappedUser);

              localStorage.setItem(
                SESSION_KEY,
                JSON.stringify(mappedUser)
              );

              if (
                mappedUser.role === "admin"
              ) {
                await fetchRegisteredUsers(
                  token
                );
              }
            } else {
              logout();
            }
          } else {
            logout();
          }
        } catch (error) {
          console.error(error);

          try {
            setCurrentUser(
              JSON.parse(session)
            );
          } catch {
            logout();
          }
        }
      } else {
        setCurrentUser(null);
      }

      setReady(true);
    };

    initializeAuth();
  }, []);
    const login = async ({ email, password, role }) => {
    try {
      console.log("AuthContext: Sending login request...");

      const response = await fetch(
        `${API_BASE_URL}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          ok: false,
          error:
            data.message ||
            "Invalid credentials.",
        };
      }

      if (
        data.success &&
        data.token &&
        data.user
      ) {
        const mappedUser =
          mapUserToFrontend(data.user);

        if (
          role &&
          mappedUser.role !== role
        ) {
          return {
            ok: false,
            error:
              role === "admin"
                ? "This account is not an admin account."
                : "This account is not a student account.",
          };
        }

        localStorage.setItem(
          TOKEN_KEY,
          data.token
        );

        localStorage.setItem(
          SESSION_KEY,
          JSON.stringify(mappedUser)
        );

        setCurrentUser(mappedUser);

        if (
          mappedUser.role === "admin"
        ) {
          await fetchRegisteredUsers(
            data.token
          );
        }

        return {
          ok: true,
          user: mappedUser,
        };
      }

      return {
        ok: false,
        error: "Login failed.",
      };
    } catch (error) {
      console.error(
        "Login API error:",
        error
      );

      return {
        ok: false,
        error:
          "Failed to connect to authentication server.",
      };
    }
  };

  const registerStudent = async ({
    name,
    email,
    phone,
    password,
  }) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            phone,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          ok: false,
          error:
            data.message ||
            "Registration failed",
        };
      }

      return {
        ok: true,
        message: data.message,
      };
    } catch (error) {
      console.error(
        "Register API error:",
        error
      );

      return {
        ok: false,
        error:
          "Failed to connect to authentication server.",
      };
    }
  };

  const verifyOtpCode = async ({
    email,
    otp,
  }) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          ok: false,
          error:
            data.message ||
            "OTP verification failed",
        };
      }

      return {
        ok: true,
        message: data.message,
      };
    } catch (error) {
      console.error(
        "OTP API error:",
        error
      );

      return {
        ok: false,
        error:
          "Failed to connect to authentication server.",
      };
    }
  };
    const completeProfileData = async ({
    email,
    department,
    stream,
    semester,
    academicYear,
    rollNumber,
  }) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/complete-profile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            department,
            stream,
            semester,
            year: academicYear,
            rollNo: rollNumber,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          ok: false,
          error:
            data.message ||
            "Profile completion failed.",
        };
      }

      return {
        ok: true,
        message: data.message,
      };
    } catch (error) {
      console.error(
        "Complete Profile API Error:",
        error
      );

      return {
        ok: false,
        error:
          "Failed to connect to authentication server.",
      };
    }
  };

  const signup = registerStudent;

  const accountExists = (email) => {
    return accounts.some(
      (account) =>
        account.email.toLowerCase() ===
        email.toLowerCase()
    );
  };

  const updateProfile = (updates) => {
    setCurrentUser((current) => {
      if (!current) return current;

      const updatedUser = {
        ...current,
        ...updates,
      };

      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify(updatedUser)
      );

      return updatedUser;
    });

    setAccounts((currentAccounts) =>
      currentAccounts.map((account) =>
        account.email === currentUser?.email
          ? {
              ...account,
              ...updates,
            }
          : account
      )
    );
  };
    const value = {
    ready,
    currentUser,
    accounts,

    login,
    logout,

    signup,
    registerStudent,
    verifyOtpCode,
    completeProfileData,

    accountExists,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;