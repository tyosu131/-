import { useCallback } from "react";
import { useRouter } from "next/router";
import { NoteData, Set } from "../types/types";
import { useDebouncedCallback } from "use-debounce";
import axios from "axios";

const useNoteHandlers = (noteData: NoteData | null, setNoteData: React.Dispatch<React.SetStateAction<NoteData | null>>) => {
  const router = useRouter();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const debouncedSave = useDebouncedCallback(async (data: NoteData) => {
    try {
      await axios.post(`http://localhost:3001/api/notes/${user.id}/${data.date}`, data);
    } catch (error) {
      console.error("Failed to save note", error);
    }
  }, 1000);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, exerciseIndex: number, setIndex: number, field: keyof Set) => {
    if (!noteData) return;
    const newExercises = [...noteData.exercises];
    newExercises[exerciseIndex].sets[setIndex][field] = e.target.value;
    const newData = { ...noteData, exercises: newExercises };
    setNoteData(newData);
    debouncedSave(newData);
  }, [noteData, debouncedSave, setNoteData]);

  const handleNoteChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!noteData) return;
    const newData = { ...noteData, note: e.target.value };
    setNoteData(newData);
    debouncedSave(newData);
  }, [noteData, debouncedSave, setNoteData]);

  const handleExerciseChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (!noteData) return;
    const newExercises = [...noteData.exercises];
    newExercises[index].exercise = e.target.value;
    const newData = { ...noteData, exercises: newExercises };
    setNoteData(newData);
    debouncedSave(newData);
  }, [noteData, debouncedSave, setNoteData]);

  const handleDateChange = useCallback((newDate: string) => {
    setNoteData((prevData: NoteData | null) => {
      if (!prevData) {
        return {
          date: newDate,
          note: "",
          exercises: Array.from({ length: 30 }).map(() => ({
            exercise: "",
            sets: Array.from({ length: 5 }).map(() => ({
              weight: "",
              reps: "",
              rest: "",
            })),
          })),
        };
      }
      return {
        ...prevData,
        date: newDate,
      };
    });
    router.push(`/note/new?date=${newDate}`);
  }, [router, setNoteData]);

  return {
    handleInputChange,
    handleNoteChange,
    handleExerciseChange,
    handleDateChange,
  };
};

export default useNoteHandlers;
