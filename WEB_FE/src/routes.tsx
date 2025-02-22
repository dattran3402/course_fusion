import SignUp from "./components/pages/SignUp";
import SignIn from "./components/pages/SignIn";
import Home from "./components/pages/Home";
// import DashBoard from "./components/pages/SearchResult";
import CourseEditGeneral from "./components/pages/CourseEditGeneral";
import CourseSection from "./components/pages/CourseSection";
import About from "./components/pages/About";
import Support from "./components/pages/Support";
import PublicProfile from "./components/pages/PublicProfile";
import QuizBank from "./components/common/quiz/QuizBank";
import ManageSection from "./components/common/section-edit/ManageSection";
import CourseAnalytics from "./components/pages/CourseAnalytics";
import CoursePreview from "./components/pages/CoursePreview";
import CourseLandingPageEditor from "./components/pages/CourseLandingPageEditor";
import CourseNoSection from "./components/pages/CourseNoSection";
import AccountSettings from "./components/pages/AccountSettings";
import TeacherView from "./components/pages/TeacherView";
import ChangePassword from "./components/pages/ChangePassword";
import Performance from "./components/pages/Performance";
import ForgotPassword from "./components/pages/ForgotPassword";
import AdminView from "./components/pages/AdminView";
import Chatbot from "./components/pages/Chatbot";
import Certificate from "./components/pages/Certificate";
import DashBoard from "./components/pages/DashBoard";

const routes = [
  {
    name: "Home",
    layout: "main-layout",
    path: "/",
    icon: <></>,
    component: <Home />,
  },
  {
    name: "About",
    layout: "main-layout",
    path: "/about",
    icon: <></>,
    component: <About />,
  },
  {
    name: "Support",
    layout: "main-layout",
    path: "/support",
    icon: <></>,
    component: <Support />,
  },
  {
    name: "Account settings",
    layout: "main-layout",
    path: "/account",
    icon: <></>,
    component: <AccountSettings />,
  },
  {
    name: "Performance",
    layout: "main-layout",
    path: "/performance",
    icon: <></>,
    component: <Performance />,
  },
  {
    name: "Teacher settings",
    layout: "main-layout",
    path: "/teacher",
    icon: <></>,
    component: <TeacherView />,
  },
  {
    name: "Public profile",
    layout: "main-layout",
    path: "/profile/:id",
    icon: <></>,
    component: <PublicProfile />,
  },
  {
    name: "Certificate",
    layout: "main-layout",
    path: "/certificate/:id",
    icon: <></>,
    component: <Certificate />,
  },
  {
    name: "Sign In",
    layout: "no-layout",
    path: "/sign-in",
    icon: <></>,
    component: <SignIn />,
    intro: true,
  },
  {
    name: "Forgot password",
    layout: "no-layout",
    path: "/forgot-password",
    icon: <></>,
    component: <ForgotPassword />,
    intro: true,
  },
  {
    name: "Sign Up",
    layout: "no-layout",
    path: "/sign-up",
    icon: <></>,
    component: <SignUp />,
    intro: true,
  },
  {
    name: "Change Password",
    layout: "no-layout",
    path: "/password",
    icon: <></>,
    component: <ChangePassword />,
    intro: true,
  },
  {
    name: "DashBoard",
    layout: "main-layout",
    path: "/dashboard",
    icon: <></>,
    component: <DashBoard />,
  },
  {
    name: "Admin",
    layout: "main-layout",
    path: "/admin",
    icon: <></>,
    component: <AdminView />,
  },
  {
    name: "Course preview",
    layout: "main-layout",
    path: "/preview/:courseId",
    icon: <></>,
    component: <CoursePreview />,
  },
  {
    name: "Course no content",
    layout: "course-layout",
    path: "/",
    icon: <></>,
    component: <CourseNoSection />,
  },
  {
    name: "Course edit",
    layout: "course-layout",
    path: "/general",
    icon: <></>,
    component: <CourseEditGeneral />,
  },
  {
    name: "Course edit information",
    layout: "course-layout",
    path: "/information",
    icon: <></>,
    component: <CourseLandingPageEditor />,
  },
  {
    name: "Course Quiz Bank",
    layout: "course-layout",
    path: "/quizzes",
    icon: <></>,
    component: <QuizBank />,
  },
  {
    name: "Manage sections",
    layout: "course-layout",
    path: "/sections",
    icon: <></>,
    component: <ManageSection />,
  },
  {
    name: "Course analytics",
    layout: "course-layout",
    path: "/analytics",
    icon: <></>,
    component: <CourseAnalytics />,
  },
  {
    name: "Course Quiz Bank",
    layout: "course-layout",
    path: "/chatbot",
    icon: <></>,
    component: <Chatbot />,
  },
  {
    name: "Course section",
    layout: "course-layout",
    path: "/section/:sectionId",
    icon: <></>,
    component: <CourseSection />,
  },
];

export default routes;
