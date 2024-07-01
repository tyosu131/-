// theme.js
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  components: {
    Link: {
      baseStyle: {
        _hover: {
          cursor: "pointer",
          color: "blue.500",
          bg: "gray.100",
        },
      },
    },
    Button: {
      baseStyle: {
        _hover: {
          bg: "gray.200",
          cursor: "pointer",
        },
      },
    },
    IconButton: {
      baseStyle: {
        _hover: {
          bg: "gray.200",
          cursor: "pointer",
        },
      },
    },
    MenuItem: {
      baseStyle: {
        _hover: {
          bg: "gray.100",
          cursor: "pointer",
        },
      },
    },
  },
});

export default theme;
