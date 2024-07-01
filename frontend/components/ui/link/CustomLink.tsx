import { Link as ChakraLink, LinkProps as ChakraLinkProps } from "@chakra-ui/react";
import NextLink, { LinkProps as NextLinkProps } from "next/link";
import { PropsWithChildren } from "react";

type CustomLinkProps = PropsWithChildren<NextLinkProps & ChakraLinkProps>;

const CustomLink: React.FC<CustomLinkProps> = ({ href, as, replace, scroll, shallow, prefetch, locale, children, ...chakraProps }) => {
  return (
    <NextLink href={href} as={as} replace={replace} scroll={scroll} shallow={shallow} prefetch={prefetch} locale={locale} legacyBehavior>
      <ChakraLink {...chakraProps}>
        {children}
      </ChakraLink>
    </NextLink>
  );
};

export default CustomLink;
