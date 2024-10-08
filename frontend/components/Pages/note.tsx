import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Box, Table, Text, Spinner, Center } from "@chakra-ui/react";
import useSWR from "swr";
import Header from "../note/header";
import DateInput from "../note/dateInput";
import NoteInput from "../note/noteInput";
import TableHeader from "../note/tableheader";
import TableBody from "../note/tablebody";
import useNoteHandlers from "../../hooks/useNoteHandlers";
import { NoteData } from "../../types/types";
import { apiRequestWithAuth } from "../../utils/apiClient"; // APIクライアントのインポート

// ノートデータをAPIから取得
const fetchNoteData = async (url: string): Promise<NoteData[]> => {
  try {
    const data = await apiRequestWithAuth<NoteData[]>(url, 'get'); // ジェネリクスを使用して型定義
    return data;
  } catch (error) {
    console.error("Failed to fetch note data:", error);
    throw error;
  }
};

const Note: React.FC = () => {
  const router = useRouter();
  const { date } = router.query;
  const [noteData, setNoteData] = useState<NoteData | null>(null);

  const { data, error, isValidating } = useSWR<NoteData[]>(
    date ? `${process.env.NEXT_PUBLIC_API_URL}/api/notes/${date}` : null,
    fetchNoteData,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  useEffect(() => {
    if (data && data.length > 0) {
      const exercises = typeof data[0].exercises === 'string'
        ? JSON.parse(data[0].exercises)
        : data[0].exercises;

      // 必ず30個のexercisesがあり、各exerciseには5つのセットがあるようにする
      const filledExercises = Array.from({ length: 30 }).map((_, exerciseIndex) => {
        const existingExercise = exercises[exerciseIndex] || { exercise: "", sets: [] };
        return {
          exercise: existingExercise.exercise || "",
          sets: Array.from({ length: 5 }).map((_, setIndex) => existingExercise.sets[setIndex] || {
            weight: "",
            reps: "",
            rest: "",
          })
        };
      });

      setNoteData({
        ...data[0],
        exercises: filledExercises,
      });
    } else if (!data || data.length === 0 || error) {
      // データがない、もしくはエラーの場合でもフォームを表示
      setNoteData({
        date: date as string,
        note: "",
        exercises: Array.from({ length: 30 }).map(() => ({
          exercise: "",
          sets: Array.from({ length: 5 }).map(() => ({
            weight: "",
            reps: "",
            rest: "",
          })),
        })),
      });
    }
  }, [data, error, date]);

  const { handleInputChange, handleNoteChange, handleExerciseChange, handleDateChange } = useNoteHandlers(noteData, setNoteData);

  // ローディング中でもnoteDataが生成されていれば、フォームを表示
  if (!noteData) {
    return (
      <Center height="100vh">
        <Spinner size="xl" />
        <Text>Loading...</Text>
      </Center>
    );
  }

  const selectedDate = new Date(noteData.date);
  const isValidDate = !isNaN(selectedDate.getTime());

  return (
    <Box p={4}>
      <Header />
      <Text fontSize="2xl" mb={4} textAlign="center">
        Note
      </Text>
      {isValidDate ? (
        <DateInput date={noteData.date} onDateChange={handleDateChange} />
      ) : (
        <div>Invalid Date</div>
      )}
      <NoteInput note={noteData.note} onNoteChange={handleNoteChange} />
      <Table variant="simple" size="sm">
        <TableHeader />
        <TableBody
          exercises={noteData.exercises}
          onExerciseChange={handleExerciseChange}
          onInputChange={handleInputChange}
        />
      </Table>
    </Box>
  );
};

export default Note;
