import { useEffect } from "react";

const RedisInitializer = () => {
  useEffect(() => {
    const initRedis = async () => {
      try {
        await fetch("/api/init");
      } catch (error) {
        console.error("Error initializing Redis:", error);
      }
    };

    initRedis();
  }, []);

  return null;
};

export default RedisInitializer;
