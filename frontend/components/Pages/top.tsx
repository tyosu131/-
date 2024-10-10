import React, { useState, useMemo } from "react";
import { Box, Stack, Text, IconButton, Grid, GridItem, Button, Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { HamburgerIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useRouter } from 'next/router';
import { URLS } from '../../constants/urls';
import { generateCalendarDates } from '../../utils/calendarUtils';
import supabase from '../../../backend/supabaseClient';
import { useAuthCheck } from '../../hooks/useAuthCheck'; // useAuthCheckをインポート

const Top: React.FC = () => {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // useAuthCheckフックを使用して認証状態を管理
  const isAuthenticated = useAuthCheck();

  const handleDateClick = (date: string) => {
    router.push(`/note/${date}`);
  };

  const handlePrevMonth = () => {
    const prevMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(prevMonthDate);
  };

  const handleNextMonth = () => {
    const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(nextMonthDate);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const calendarDates = useMemo(() => generateCalendarDates(currentDate.getFullYear(), currentDate.getMonth()), [currentDate]);
  const todayString = useMemo(() => new Date().toISOString().split('T')[0], []);
  const daysOfWeek = useMemo(() => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], []);

  return (
    isAuthenticated ? (
      <Box>
        <Box position="absolute" top="10px" right="10px">
          <Menu>
            <MenuButton 
              as={IconButton} 
              aria-label="Options" 
              icon={<HamburgerIcon boxSize="1.5em" />} 
              variant="outline" 
              _hover={{ bg: "gray.200", cursor: "pointer" }} 
            />
            <MenuList>
              <MenuItem 
                onClick={() => router.push(URLS.USER_PAGE)} 
                _hover={{ bg: "gray.100", cursor: "pointer" }}
              >
                <Box fontSize="lg" py={4}>
                  User
                </Box>
              </MenuItem>
              <MenuItem 
                onClick={() => router.push(URLS.CONTACT_PAGE)} 
                _hover={{ bg: "gray.100", cursor: "pointer" }}
              >
                <Box fontSize="lg" py={4}>
                  Contact
                </Box>
              </MenuItem>
              <MenuItem 
                onClick={handleLogout} 
                _hover={{ bg: "gray.100", cursor: "pointer" }}
              >
                <Box fontSize="lg" py={4}>
                  Log Out
                </Box>
              </MenuItem>
            </MenuList>
          </Menu>
        </Box>

        <Box mt={4} textAlign="center">
          <Stack direction="column" align="center" justify="center" mb={6} spacing={4}>
            <Stack direction="row" align="center" justify="center">
              <IconButton 
                icon={<ChevronLeftIcon />} 
                aria-label="Previous Month" 
                onClick={handlePrevMonth} 
                _hover={{ bg: "gray.200", cursor: "pointer" }} 
              />
              <Text fontSize="2xl" mx={2}>{currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月</Text>
              <IconButton 
                icon={<ChevronRightIcon />} 
                aria-label="Next Month" 
                onClick={handleNextMonth} 
                _hover={{ bg: "gray.200", cursor: "pointer" }} 
              />
            </Stack>
            <Button 
              onClick={() => router.push(URLS.NOTE_NEW(new Date().toISOString().split('T')[0]))} 
              width="200px" 
              mt={4} 
              mb={8} 
              _hover={{ bg: "gray.200", cursor: "pointer" }}
            >
              作成
            </Button>
          </Stack>
        </Box>

        <Box mt={4} textAlign="center" w="100%">
          <Grid templateColumns="repeat(7, 1fr)" gap={0} border="1px solid" borderColor="gray.200">
            {daysOfWeek.map((day, index) => (
              <GridItem 
                key={day} 
                textAlign="center" 
                border="1px solid" 
                borderBottom="none" 
                borderColor="gray.200" 
                p={2} 
                color={index === 0 ? "red.500" : index === 6 ? "blue.500" : "black"}
              >
                <Text fontSize="lg" fontWeight="bold">{day}</Text>
              </GridItem>
            ))}

            {calendarDates.map((dateObj, index) => (
              <GridItem 
                key={index} 
                textAlign="center" 
                border="1px solid" 
                borderColor="gray.200" 
                p={2} 
                h="100px" 
                bg={dateObj?.date === todayString ? "yellow.200" : "white"} 
                _hover={{ bg: "gray.100", cursor: "pointer" }}
              >
                {dateObj ? (
                  <Button 
                    onClick={() => handleDateClick(dateObj.date)} 
                    variant="ghost" 
                    h="100%" 
                    w="100%" 
                    _hover={{ bg: "gray.200", cursor: "pointer" }}
                  >
                    <Text 
                      color={new Date(dateObj.date).getDay() === 0 ? "red.500" : new Date(dateObj.date).getDay() === 6 ? "blue.500" : "black"}
                    >
                      {new Date(dateObj.date).getDate()}
                    </Text>
                  </Button>
                ) : (
                  <Box h="100%" w="100%"></Box>
                )}
              </GridItem>
            ))}
          </Grid>
        </Box>

        <Box mt={8} display="flex" justifyContent="center"></Box>
      </Box>
    ) : null
  );
};

export default Top;
