import { useState, useEffect } from "react";
import Cards from "../components/Cards/Cards";
import { SkeletonLoader } from "../assets";
import axios from "../api/axiosInstance";
import PreNav from "../components/Navbar/PreNav";
import { motion, AnimatePresence } from "framer-motion";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    try {
      const fetchCourse = async () => {
        const { data } = await axios.get(
          "/api/course/",

          { withCredentials: true }
        );
        setCourses(data);
      };
      fetchCourse();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);
  return (
    <>
      <PreNav name={"COURSES"} />
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="card-divs-wrap"
        >
          {loading && <SkeletonLoader />}
          {!loading &&
            courses &&
            courses.map((item, index) => (
              <Cards
                key={index}
                imgsrc={
                  item?.photo === null
                    ? "/assets/placeholder.avif"
                    : item?.photo
                }
                info={item.cleanedName}
                courseId={item.id}
              />
            ))}
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default Courses;
