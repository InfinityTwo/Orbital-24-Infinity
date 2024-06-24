"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

import { auth } from "@/app/firebase/config";
import { ITopic } from "@/components/dashboard/topic/constants";

import LoadingComponent from "../firebase-auth/Loading/LoadingComponent";
import QuestionComponent, { IQuestion } from "./questions";
import QuestionNavbar from "./questions/questions-navbar";
import styles from "./TopicComponent.module.sass";

interface IData {
  title: string;
  topicID: number;
  questions: IQuestion[];
}

const TopicComponent = () => {
  const [user, isAuthLoading, error] = useAuthState(auth);
  const [topic, setTopic] = useState<ITopic>();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const router = useRouter();
  const searchParams = useParams();
  const { id } = searchParams;

  const dummyData: IData = {
    title: "CS2040S Finals Practice",
    topicID: parseInt(typeof id === "string" ? id : id[0]),
    questions: [
      {
        question: "What is the time complexity of binary search?",
        selected: 3,
        options: [
          {
            option: "O(n)",
            correct: false,
          },
          {
            option: "O(log n)",
            correct: true,
          },
          {
            option: "O(n log n)",
            correct: false,
          },
          {
            option: "O(n^2)",
            correct: false,
          },
        ],
      },
      {
        question: "What is the time complexity of quicksort?",
        selected: -1,
        options: [
          {
            option: "O(n)",
            correct: false,
          },
          {
            option: "O(log n)",
            correct: false,
          },
          {
            option: "O(n log n)",
            correct: true,
          },
          {
            option: "O(n^2)",
            correct: false,
          },
        ],
      },
      {
        question: "What is the time complexity of mergesort?",
        selected: -1,
        options: [
          {
            option: "O(n)",
            correct: false,
          },
          {
            option: "O(log n)",
            correct: false,
          },
          {
            option: "O(n log n)",
            correct: true,
          },
          {
            option: "O(n^2)",
            correct: false,
          },
        ],
      },
    ],
  };

  const [questions, setQuestions] = useState(dummyData);

  const updateQuestions = (newSelection: number) => {
    setQuestions((prev) => {
      let newQuestions = [...prev.questions];
      newQuestions[currentQuestion].selected = newSelection;
      return {
        ...prev,
        questions: newQuestions,
      };
    });
  };

  const fetchData = useCallback(() => {
    const asyncFetchData = async () => {
      const res: ITopic[] = await fetch("/api/topics/retrieve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: user,
          single: true,
          topicID: questions.topicID,
        }),
      }).then((res: Response) => res.json());
      if (res.length <= 0) {
        router.push("/dashboard");
      } else {
        setTopic(res[0]);
        setIsFetchingData(false);
      }
    };
    setIsFetchingData(true);
    asyncFetchData();
  }, [user, questions.topicID, router]);

  useEffect(() => {
    if (!topic && user && !isAuthLoading) {
      fetchData();
    }
  }, [topic, user, fetchData, isAuthLoading]);

  useEffect(() => {
    // TODO fetch questions from backend
    if (questions.questions.length <= 0) {
      router.push("/dashboard");
    }
  }, [questions, router]);

  return (
    <div className={styles.topicComponent}>
      {isAuthLoading || isFetchingData ? (
        <LoadingComponent />
      ) : (
        <div>
          <QuestionNavbar
            data={topic?.data ? topic.data : ""}
            title={topic?.topicName ? topic.topicName : ""}
            fetchData={fetchData}
            topicID={questions.topicID}
          />
          <QuestionComponent
            question={questions.questions[currentQuestion]}
            questionNumber={currentQuestion}
            lastQuestionNumber={questions.questions.length - 1}
            onPrevQn={(newSelection: number) => {
              updateQuestions(newSelection);
              setCurrentQuestion((prev) => Math.max(0, prev - 1));
            }}
            onNextQn={(newSelection: number) => {
              if (
                newSelection >= 0 &&
                newSelection <
                  questions.questions[currentQuestion].options.length
              ) {
                updateQuestions(newSelection);
                setCurrentQuestion((prev) =>
                  Math.min(questions.questions.length - 1, prev + 1)
                );
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default TopicComponent;
