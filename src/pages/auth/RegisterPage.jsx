import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { register } from "../../api/auth";
import { getHomePathForRole } from "../../context/auth-context";
import AuthVisualAside from "../../components/auth/AuthVisualAside";


const FACULTY_DEPARTMENTS = {
  "Applied Sciences": [
    "Biomedical Sciences",
    "Chemistry",
    "Food Technology",
    "Nature Conservation",
    "Physics and Mathematics",
  ],
  "Business and Management Sciences": [
    "Accounting",
    "Finance",
    "Human Resource Management",
    "Logistics",
    "Marketing",
    "Public Administration",
    "Retail Business Management",
    "Tourism and Hospitality Management",
  ],
  "Education": [
    "Adult and Continuing Education",
    "Foundation Phase Teacher Education",
    "Intermediate Phase Teacher Education",
    "Senior Phase and FET Teacher Education",
  ],
  "Engineering and the Built Environment": [
    "Chemical Engineering",
    "Civil Engineering",
    "Construction Management",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Quantity Surveying",
    "Urban and Regional Planning",
  ],
  "Health and Wellness Sciences": [
    "Biomedical Technology",
    "Dental Sciences",
    "Emergency Medical Care",
    "Environmental Health",
    "Nursing",
    "Occupational Therapy",
    "Physiotherapy",
    "Radiography",
  ],
  "Informatics and Design": [
    "Computer Systems Engineering",
    "Design",
    "Fashion",
    "Film and Photographic Studies",
    "Graphic Design",
    "Information Technology",
    "Journalism",
    "Multimedia and Communication Design",
  ],
};

const FACULTIES = Object.keys(FACULTY_DEPARTMENTS);


function Field({ id, label, hint, children }) {
  return (
    <div className="grid gap-2.5">
      <label htmlFor={id} className="font-semibold">
        {label}
      </label>
      {children}
      {hint && (
        <span className="text-sm leading-5 text-gray-500">{hint}</span>
      )}
    </div>
  );
}


const inputClass =
  "h-14 w-full rounded-lg border border-[#dedede] bg-white px-4 text-base text-[#161616] shadow-[0_2px_5px_rgba(0,0,0,0.04)] outline-none transition placeholder:text-[#929292] focus:border-[#087dbb] focus:ring-4 focus:ring-[#087dbb]/20 disabled:cursor-not-allowed disabled:opacity-50";

const selectClass =
  "h-14 w-full rounded-lg border border-[#dedede] bg-white px-4 text-base text-[#161616] shadow-[0_2px_5px_rgba(0,0,0,0.04)] outline-none transition focus:border-[#087dbb] focus:ring-4 focus:ring-[#087dbb]/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50";


export default function RegisterPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  
  useEffect(() => {
    if (user) {
      navigate(getHomePathForRole(user.role), { replace: true });
    }
  }, [navigate, user]);


  const [role, setRole] = useState("STUDENT");
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");


  const [studentNumber, setStudentNumber] = useState("");
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");


  const [organizationName, setOrganizationName] = useState("");
  const [organizationType, setOrganizationType] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [organizerStaffNumber, setOrganizerStaffNumber] = useState("");
  const [adminStaffNumber, setAdminStaffNumber] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

 
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  
  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setStudentNumber("");
    setFaculty("");
    setDepartment("");
    setYearOfStudy("");
    setOrganizationName("");
    setOrganizationType("");
    setContactEmail("");
    setOrganizerStaffNumber("");
    setAdminStaffNumber("");
    setError("");
  };

  
  const handleFacultyChange = (selectedFaculty) => {
    setFaculty(selectedFaculty);
    setDepartment("");
  };

  
  const validateUniversityEmail = (val) =>
    /^[^\s@]+@(?:mycput\.ac\.za|cput\.ac\.za)$/i.test(val.trim());

  const validateContactEmail = (val) =>
    /^[^\s@]+@[^\s@]+\.ac\.za$/i.test(val.trim());

  const validatePhone = (val) =>
    /^0[6-8][0-9]{8}$/.test(val.replace(/\s/g, ""));

  const validate = () => {
    if (!firstName.trim() || !surname.trim()) return "First name and surname are required";
    if (!validateUniversityEmail(email))
      return "Use an email ending in @mycput.ac.za or @cput.ac.za";
    if (password.length < 8)
      return "Password must be at least 8 characters";
    if (password !== confirmPassword)
      return "Passwords do not match";
    if (!validatePhone(phoneNumber))
      return "Please enter a valid South African mobile number (e.g. 0821234567)";

    if (role === "STUDENT") {
      if (!studentNumber.trim()) return "Student number is required";
      if (!faculty) return "Please select your faculty";
      if (!department) return "Please select your department";
      if (!yearOfStudy || yearOfStudy < 1 || yearOfStudy > 6)
        return "Year of study must be between 1 and 6";
    }

    if (role === "ORGANIZER") {
      if (!organizerStaffNumber.trim()) return "Staff number is required";
      if (!organizationName.trim()) return "Organization name is required";
      if (!organizationType.trim()) return "Organization type is required";
      if (!validateContactEmail(contactEmail))
        return "Please enter a valid contact email ending in .ac.za";
    }

    if (role === "ADMIN") {
      if (!adminStaffNumber.trim()) return "Staff number is required";
    }
    if (!termsAccepted) return "Please accept the university IT usage policy and event terms";

    return null; // null means no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    
    const payload =
      role === "STUDENT"
        ? {
            name: `${firstName.trim()} ${surname.trim()}`,
            email,
            password,
            phoneNumber: phoneNumber.replace(/\s/g, ""),
            role: "STUDENT",
            studentNumber: studentNumber.trim(),
            faculty,
            department,
            yearOfStudy: parseInt(yearOfStudy, 10),
          }
        : role === "ORGANIZER"
          ? {
            name: `${firstName.trim()} ${surname.trim()}`,
            email,
            password,
            phoneNumber: phoneNumber.replace(/\s/g, ""),
            role,
            staffNumber: organizerStaffNumber.trim(),
            organizationName: organizationName.trim(),
            organizationType: organizationType.trim(),
            contactEmail,
          }
          : {
              name: `${firstName.trim()} ${surname.trim()}`,
              email,
              password,
              phoneNumber: phoneNumber.replace(/\s/g, ""),
              role,
              staffNumber: adminStaffNumber.trim(),
            };

    setLoading(true);
    try {
      const authResponse = await register(payload);
      login(authResponse);
      navigate(getHomePathForRole(authResponse.role), { replace: true });
    } catch (err) {
      const message = err.response?.data?.message;
      setError(message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  
  const departments = faculty ? FACULTY_DEPARTMENTS[faculty] : [];

  return (
    <main className="grid min-h-screen bg-[#f6f8fb] font-sans text-[#1d2433] lg:grid-cols-2">
      <AuthVisualAside />

      <section className="flex justify-center px-5 py-10 sm:px-8 sm:py-12 lg:max-h-screen lg:overflow-y-auto lg:px-10 xl:px-14" aria-labelledby="register-title">
        <div className="my-auto w-full max-w-[450px]">
        <header className="mb-7">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#1f6fd1] lg:hidden">UniVent</p>
          <h1 id="register-title" className="text-[22px] font-bold leading-tight">Create your UniVent account</h1>
          <p className="mt-1 text-sm text-[#6b7385]">Choose the account type that matches your role at the university.</p>
        </header>

        <form onSubmit={handleSubmit} className="grid gap-4">

          
          <div className="grid gap-2.5">
            <span className="font-semibold">I am a</span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {["STUDENT", "ORGANIZER", "ADMIN"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleChange(r)}
                  className={`min-h-[82px] rounded-[10px] border px-3 py-3 text-left transition
                    ${
                      role === r
                        ? "border-[#1f6fd1] bg-[#e8f1fc] text-[#1d2433] shadow-[0_0_0_1px_#1f6fd1_inset]"
                        : "border-[#e3e7ef] bg-white text-[#1d2433] hover:border-[#1f6fd1]"
                    }`}
                >
                  <span className="block text-sm font-semibold">{r.charAt(0) + r.slice(1).toLowerCase()}</span>
                  <span className="mt-1 block text-xs font-normal leading-[1.35] text-[#6b7385]">
                    {r === "STUDENT"
                      ? "Register for events and manage your tickets."
                      : r === "ORGANIZER"
                        ? "Staff or society leader who runs events."
                        : "ICT Services staff. Use your staff number."}
                  </span>
                </button>
              ))}
            </div>
          </div>

          
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="firstName" label="First name">
              <input id="firstName" name="firstName" type="text" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={loading} className={inputClass.replace("h-14", "h-11").replace("text-base", "text-sm")} />
            </Field>
            <Field id="surname" label="Surname">
              <input id="surname" name="surname" type="text" autoComplete="family-name" value={surname} onChange={(e) => setSurname(e.target.value)} disabled={loading} className={inputClass.replace("h-14", "h-11").replace("text-base", "text-sm")} />
            </Field>
          </div>

          
          {role === "STUDENT" && (
            <>
              <Field id="studentNumber" label="Student number">
                <input
                  id="studentNumber"
                  name="studentNumber"
                  type="text"
                  placeholder="e.g. 221234567"
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value)}
                  disabled={loading}
                  className={inputClass.replace("h-14", "h-11").replace("text-base", "text-sm")}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="faculty" label="Faculty">
                  <select id="faculty" value={faculty} onChange={(e) => handleFacultyChange(e.target.value)} disabled={loading} className={selectClass.replace("h-14", "h-11").replace("text-base", "text-sm")}>
                    <option value="">Select your faculty</option>
                    {FACULTIES.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </Field>
                <Field id="department" label="Department">
                  <select id="department" value={department} onChange={(e) => setDepartment(e.target.value)} disabled={loading || !faculty} className={selectClass.replace("h-14", "h-11").replace("text-base", "text-sm")}>
                    <option value="">{faculty ? "Select your department" : "Select a faculty first"}</option>
                    {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>
              </div>

              <Field id="yearOfStudy" label="Year of study">
                <select
                  id="yearOfStudy"
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(e.target.value)}
                  disabled={loading}
                  className={selectClass.replace("h-14", "h-11").replace("text-base", "text-sm")}
                >
                  <option value="">Select your year</option>
                  {[1, 2, 3, 4, 5, 6].map((y) => (
                    <option key={y} value={y}>
                      Year {y}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          )}

          
          {role === "ORGANIZER" && (
            <>
              <p className="rounded-lg bg-[#fdf3e1] px-3 py-2.5 text-xs leading-5 text-[#7a5a10]">
                Organizer accounts are reviewed by an administrator before you can publish events.
              </p>
              <Field id="organizerStaffNumber" label="Staff number">
                <input id="organizerStaffNumber" name="staffNumber" type="text" placeholder="e.g. STF0147" value={organizerStaffNumber} onChange={(e) => setOrganizerStaffNumber(e.target.value)} disabled={loading} className={inputClass.replace("h-14", "h-11").replace("text-base", "text-sm")} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
              <Field id="organizationType" label="Organization type">
                <input
                  id="organizationType"
                  name="organizationType"
                  type="text"
                  placeholder="Enter the type of society or organization"
                  value={organizationType}
                  onChange={(e) => setOrganizationType(e.target.value)}
                  disabled={loading}
                  className={inputClass.replace("h-14", "h-11").replace("text-base", "text-sm")}
                />
              </Field>
              <Field id="organizationName" label="Society or organization">
                <input
                  id="organizationName"
                  name="organizationName"
                  type="text"
                  placeholder="e.g. CPUT Computer Science Society"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  disabled={loading}
                  className={inputClass.replace("h-14", "h-11").replace("text-base", "text-sm")}
                />
              </Field>
              </div>

              <Field
                id="contactEmail"
                label="Organization contact email"
                hint="The public email students can use to reach your organization"
              >
                <input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  autoComplete="email"
                  placeholder="e.g. cssociety@mycput.ac.za"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  disabled={loading}
                  className={inputClass.replace("h-14", "h-11").replace("text-base", "text-sm")}
                />
              </Field>
            </>
          )}

          {role === "ADMIN" && (
            <>
              <p className="rounded-lg bg-[#e4f6ec] px-3 py-2.5 text-xs leading-5 text-[#1f7a46]">
                Register with your ICT staff details.
              </p>
              <Field id="adminStaffNumber" label="Staff number">
                <input
                  id="adminStaffNumber"
                  name="staffNumber"
                  type="text"
                  autoComplete="username"
                  placeholder="e.g. STF0001"
                  value={adminStaffNumber}
                  onChange={(e) => setAdminStaffNumber(e.target.value)}
                  disabled={loading}
                  className={inputClass.replace("h-14", "h-11").replace("text-base", "text-sm")}
                />
              </Field>
            </>
          )}

          <Field id="email" label="University email">
            <input id="email" name="email" type="email" autoComplete="email" placeholder="name@mycput.ac.za or name@cput.ac.za" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} className={inputClass.replace("h-14", "h-11").replace("text-base", "text-sm")} />
          </Field>
          <Field id="phone" label="Mobile number" hint="South African number e.g. 0821234567">
            <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="e.g. 0821234567" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} disabled={loading} className={inputClass.replace("h-14", "h-11").replace("text-base", "text-sm")} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="password" label="Password" hint="At least 8 characters.">
              <input id="password" name="password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className={inputClass.replace("h-14", "h-11").replace("text-base", "text-sm")} />
            </Field>
            <Field id="confirmPassword" label="Confirm password">
              <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} className={inputClass.replace("h-14", "h-11").replace("text-base", "text-sm")} />
            </Field>
          </div>
          <label className="flex items-start gap-2 text-xs leading-5 text-[#6b7385]">
            <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} disabled={loading} className="mt-1 accent-[#1f6fd1]" />
            <span>I accept the university IT usage policy and event terms.</span>
          </label>

          
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span className="mt-0.5 shrink-0">⚠</span>
              <span>{error}</span>
            </div>
          )}

          
          <button
            type="submit"
            disabled={loading}
            className="mt-1 min-h-11 w-full rounded-lg bg-[#1f6fd1] text-sm font-semibold text-white transition hover:bg-[#195fb5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1f6fd1]/20 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        
        <p className="mt-5 text-center text-[13px] text-[#6b7385]">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#087dbb] hover:text-[#066a9f] hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#087dbb]/20"
          >
            Sign in
          </Link>
        </p>
        </div>
      </section>
    </main>
  );
}
