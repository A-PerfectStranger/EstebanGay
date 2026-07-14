import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Onboarding } from './pages/Onboarding';
import { LessonList } from './pages/LessonList';
import { Exercise } from './pages/Exercise';
import { Results } from './pages/Results';
import { Profile } from './pages/Profile';
import { Practice } from './pages/Practice';
import { Progress } from './pages/Progress';

export const router = createBrowserRouter([
  {
    path: '/onboarding',
    Component: Onboarding,
  },
  {
    path: '/exercise/:lessonId',
    Component: Exercise,
  },
  {
    path: '/results/:lessonId',
    Component: Results,
  },
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'lessons', Component: LessonList },
      { path: 'practice', Component: Practice },
      { path: 'progress', Component: Progress },
      { path: 'profile', Component: Profile },
    ],
  },
]);
