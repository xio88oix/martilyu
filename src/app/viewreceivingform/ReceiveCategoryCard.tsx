"use client";
import {
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Collapse,
  IconButton,
  IconButtonProps,
  styled,
} from "@mui/material";
import { Dispatch, SetStateAction, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Link from "next/link";

interface ReceiveCategoryCardProps {
  title: string;
  details: any; // TODO: improve typing
  imagePath: string;
  setSelected: Dispatch<SetStateAction<string>>;
  selected: boolean;
}

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme }) => ({
  variants: [
    {
      props: ({ expand }) => !expand,
      style: {
        transform: "rotate(0deg)",
      },
    },
    {
      props: ({ expand }) => !!expand,
      style: {
        transform: "rotate(180deg)",
      },
    },
  ],
}));

export default function ReceiveCategoryCard(props: ReceiveCategoryCardProps) {
  // const [selected, setSelected] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card
      sx={{
        minWidth: "250px",
        display: "flex",
        flexGrow: 0,
        maxWidth: "450px",
      }}
    >
      <CardActionArea
        onClick={() => {
          if (props.selected) {
            props.setSelected("");
          } else {
            props.setSelected(props.title);
          }
        }}
        data-active={props.selected ? "" : undefined}
        sx={{
          flexFlow: "column",
          display: "flex",
          "&[data-active]": {
            border: "solid 4px #23404F",
          },
        }}
      >
        <CardHeader className="body1-bold" title={props.title ?? "Test Card"} />
        <CardMedia
          sx={{ width: "150px" }}
          height="140"
          component="img"
          image={props.imagePath}
          alt="not found"
        />
        <CardActions disableSpacing sx={{ justifyContent: "end" }}>
          <ExpandMore
            expand={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMoreIcon titleAccess="more" />
          </ExpandMore>
        </CardActions>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent>
            <span>
              {props.details}
              {props.title === "Contract Receiving" ? (
                <Link
                  style={{ fontSize: "1.6rem" }}
                  href="https://askfinance.cia/af?id=finance_kb_article&sys_id=52f3225d1d9a3f801f0b164945f3fb4b"
                >
                  here
                </Link>
              ) : (
                <></>
              )}
            </span>
          </CardContent>
        </Collapse>
      </CardActionArea>
    </Card>
  );
}
