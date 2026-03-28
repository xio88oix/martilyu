"use client";

import {
  Clear,
  Close,
  EditCalendar,
  HelpOutline,
  LightbulbOutlined,
  Search,
} from "@mui/icons-material";
import {
  AppBar,
  autocompleteClasses,
  Box,
  Button,
  ButtonProps,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Drawer,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  Popper,
  Radio,
  Select,
  styled,
  TextField,
  TextFieldProps,
  Toolbar,
  Tooltip,
  tooltipClasses,
  TooltipProps,
  Typography,
} from "@mui/material";
import type { Breakpoint } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import React, {
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useState,
} from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DataGrid } from "@mui/x-data-grid";
import dayjs, { Dayjs } from "dayjs";

// NOTE: PrintLabelMenu does not exist yet — stub until converted from PDF
const PrintLabelMenu: FC<{ isComponent?: boolean }> = () => <></>;

export function RadioLarge(props: {
  className?: string;
  value?: string;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <FormControlLabel
      className={props.className}
      value={props.value}
      label={props.label}
      control={
        <Radio
          className={props.className}
          disabled={props.disabled}
          sx={{
            "& .MuiSvgIcon-root": {
              fontSize: "1.6rem !important",
            },
            "&.MuiButtonBase-root.Mui-checked": {
              color: "#bf4d00 !important",
            },
            "& font-medium .MuiTypography-root": {
              fontSize: "inherit !important",
            },
          }}
        />
      }
    />
  );
}

export function CheckboxLarge({
  checked,
  onChange,
  ...rest
}: {
  checked?: boolean;
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => void;
  [key: string]: unknown;
}) {
  return (
    <Checkbox
      checked={checked}
      onChange={onChange}
      {...(rest as object)}
      sx={{
        "& .MuiSvgIcon-root": {
          fontSize: "2.6rem !important",
        },
        "&.MuiButtonBase-root.Mui-checked": {
          color: "#bf4d00 !important",
        },
      }}
    />
  );
}

export const StyledTextField = styled(TextField)<TextFieldProps>(() => ({
  "& .MuiInputLabel-shrink": {
    color: "#bf4d00 !important",
    fontSize: "1.6rem",
    transition: "color 200ms ease !important, font-size 200ms ease !important",
  },
  "& .MuiInputBase-input": {
    fontSize: "1.6rem",
  },
  "& .MuiFormControl-root .MuiInputBase-root .MuiInputBase-input": {
    fontSize: "1rem !important",
  },
  "& .MuiInputBase-root .MuiChip-label": {
    fontSize: "1.6rem !important",
  },
  "& .MuiInputBase-input.Mui-disabled": {
    fontSize: "1.6rem",
    color: "black !important",
    textFillColor: "black",
  },
  "& .MuiInputBase-root.Mui-disabled": {
    fontSize: "1.6rem",
    backgroundColor: "#f8f8f2",
  },
}));

export const ReadOnlyTextField = styled(TextField)<TextFieldProps>(() => ({
  "&.MuiTextField-root": {
    display: "flex",
    flexDirection: "row-reverse",
    justifyContent: "center",
  },
  "& .MuiFormLabel-root.Mui-disabled": {
    fontSize: "1.6rem",
    color: "#23404F",
    fontWeight: 700,
  },
  "& .MuiInputBase-input.Mui-disabled": {
    fontSize: "1.6rem",
    WebkitTextFillColor: "#23404F !important",
    fontWeight: 400,
  },
  "& .MuiInputBase-input": {
    fontSize: "1.6rem",
  },
}));

export const StyledPopper = styled(Popper)({
  [`& .${autocompleteClasses.listbox}`]: {
    fontSize: "1.6rem",
    color: "red",
    backgroundColor: "green",
  },
});

export function MySimpleTextDialog(
  dialogContentText: string,
  buttonName?: string,
  dialogTitle?: string,
) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <div>
      <Button className="button-light" variant="outlined" onClick={handleOpen}>
        {buttonName || "Dialog Button"}
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle variant="h2">{dialogTitle || "Dialog Title"}</DialogTitle>
        <DialogContent>
          <DialogContentText className="body1">
            {dialogContentText}
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const SearchField = (props: {
  label: string;
  value?: unknown;
  handleChange?: (e: unknown) => void;
  handleSearch?: (searchVal: unknown) => void;
  className?: string;
  fullWidth?: boolean;
  disable?: boolean;
  title?: unknown;
  required?: boolean;
  // setValue?: Dispatch<SetStateAction<any>>;
}) => {
  const [searchVal, setSearchVal] = useState("");
  const handleClick = () => {
    // console.log("the Search value is ", searchVal);
    props.handleSearch?.(searchVal);
  };
  return (
    <StyledTextField
      required={props.required ?? false}
      title={(props.title as string | undefined) ?? ""}
      disabled={props.disable ?? false}
      fullWidth={props.fullWidth ?? false}
      variant="filled"
      value={props.value ?? searchVal}
      label={props.label}
      className={"body1 text-onbackground " + props.className}
      onChange={
        props.handleChange
          ? props.handleChange
          : (e) => {
              const val = (e as React.ChangeEvent<HTMLInputElement>).target
                .value;
              setSearchVal(val);
            }
      }
      InputProps={{
        endAdornment: (
          <IconButton onClick={handleClick}>
            <Search className="section-welcome__search-icon-button" />
          </IconButton>
        ),
      }}
    />
  );
};

export const CustomSearchField = (props: {
  label: string;
  value?: unknown;
  handleChange?: (e: unknown) => void;
  handleSearch?: (searchVal: unknown) => void;
  // setValue?: Dispatch<SetStateAction<any>>;
}) => {
  return (
    <StyledTextField
      variant="filled"
      value={props?.value}
      label={props.label}
      className="body1 text-onbackground"
      onChange={props.handleChange}
      InputProps={{
        endAdornment: (
          <IconButton onClick={props.handleSearch as React.MouseEventHandler}>
            <Search className="section-welcome__search-icon-button" />
          </IconButton>
        ),
      }}
    />
  );
};

export const CustomCalendarIcon = (props: unknown) => (
  <IconButton {...(props as object)}>
    <EditCalendar
      sx={{
        color: "#122C38",
        "& .MuiSvgIcon-root": {
          fontSize: "2.6rem",
        },
      }}
    />
  </IconButton>
);

export const CustomClearIcon = (props: unknown) => (
  <IconButton {...(props as object)}>
    <Clear
      sx={{
        color: "#122C38",
        "& .MuiSvgIcon-root": {
          fontSize: "1.6rem",
        },
      }}
    />
  </IconButton>
);

export const CustomTextField = (props: TextFieldProps) => (
  <StyledTextField fullWidth variant="filled" {...props} />
);

// export const CustomDateTextField = (props: any) => (
//   <StyledTextField
//     onClick={(e) => props.setOpen(true)}
//     fullWidth
//     variant="filled"
//     {...props}
//   />
// );

export const CustomSelect = (props: unknown) => {
  return (
    <Select
      sx={{
        display: "flex",
        "& .MuiSelect-select": {
          alignItems: "center",
          height: "6rem !important",
          display: "flex",
          padding: "0 2rem",
        },
      }}
      className="body1"
      inputProps={{
        style: {
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        },
      }}
      variant="filled"
      {...(props as object)}
    />
  );
};

export const MyDatePicker = (props: {
  label: string;
  onChange?: (() => void) | ((arg0: unknown, arg1: unknown) => void);
  defaultValue?: unknown;
  minDate?: unknown;
  // NOTE: typo "disableFutre" preserved from source — callers use this exact name
  disableFutre?: boolean;
  maxDate?: unknown;
  value?: unknown;
  required?: boolean;
  className?: string;
  title?: string;
  isDisabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        disabled={props.isDisabled}
        className={props.className ?? ""}
        open={open ?? false}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        defaultValue={(props.defaultValue as Dayjs | null | undefined) ?? null}
        disableFuture={props.disableFutre ?? false}
        minDate={props.minDate as Dayjs | undefined}
        maxDate={props.maxDate as Dayjs | undefined}
        value={props.value as Dayjs | null | undefined}
        sx={{
          fontSize: "1.6rem",
          "& .MuiFormLabel-root": {
            fontSize: "1.6rem",
          },
          width: "100%",
        }}
        label={props.label}
        onChange={
          props.onChange as
            | ((
                value: Dayjs | null,
                context: import("@mui/x-date-pickers").PickerChangeHandlerContext<
                  import("@mui/x-date-pickers").DateValidationError
                >,
              ) => void)
            | undefined
        }
        slots={{
          openPickerButton: CustomCalendarIcon,
        }}
        slotProps={{
          textField: {
            onClick: (e) => {
              e.preventDefault();
              setOpen(true);
            },
            required: props.required,
            variant: "filled",
            size: "medium",
            title: props.title ?? "",
            sx: {
              fontSize: "1.6rem",
              width: "100%",
              "& .MuiInputLabel-shrink": {
                color: "#bf4d00 !important",
                fontSize: "1.6rem",
                transition:
                  "color 200ms ease !important, font-size 200ms ease !important",
              },
              "& .MuiInputBase-input": {
                fontSize: "1.6rem",
              },
              "& .MuiFormControl-root .MuiInputBase-root .MuiInputBase-input": {
                fontSize: "1rem !important",
              },
            },
          },
          popper: {
            sx: {
              "& .MuiButtonBase-root": {
                fontSize: "1.6rem !important",
              },
              "& .MuiPickersCalendarHeader-labelContainer": {
                fontSize: "1.6rem !important",
              },
              "& .MuiPickersYear-yearButton": {
                fontSize: "1.6rem !important",
              },
            },
          },
          field: { clearable: true },
        }}
      />
    </LocalizationProvider>
  );
};

export const MyDataGrid = ({
  rows,
  cols,
  ...rest
}: {
  rows: unknown[];
  cols: unknown[];
  height?: string;
  [key: string]: unknown;
}) => {
  return (
    <Box
      sx={{
        width: "100%",
        border: "0px",
        height: (rest.height as string) ?? "60vh",
        // height: "auto",
        "& .col-header": {
          backgroundColor: "#23404F",
          color: "#F8F8F2",
          fontSize: "1.6rem",
          paddingLeft: "1rem",
        },
      }}
    >
      <DataGrid
        rows={rows as Parameters<typeof DataGrid>[0]["rows"]}
        columns={cols as Parameters<typeof DataGrid>[0]["columns"]}
        {...(rest as object)}
        sx={{
          // height: "600px",
          "&.MuiDataGrid-root": {
            border: "0px",
          },
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "#23404F !important",
            color: "#F8F8F2",
            fontSize: "1.6rem",
            // flexGrow: "1",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            textWrap: "auto",
            // flexGrow: "1",
          },
          "& .MuiDataGrid-columnHeaderTitleContainerContent .MuiSvgIcon-root": {
            fontSize: "1.6rem",
            color: "white",
          },
          // "& .MuiDataGrid-filler": {
          //   display: "none",
          // },
          "& .MuiDataGrid-cell": {
            fontSize: "1.6rem",
            height: "auto",
          },
          "& .MuiDataGrid-footerContainer": {
            fontSize: "1.6rem !important",
          },
          "& .MuiTablePagination-displayedRows": {
            fontSize: "1.6rem !important",
          },
          "& .MuiSelect-standard": {
            alignContent: "center",
          },
          "& .MuiTablePagination-selectLabel": {
            fontSize: "1.6rem",
            textTransform: "capitalize",
          },
          "& .MuiDataGrid-iconButtonContainer .MuiSvgIcon-root": {
            color: "white",
            fontSize: "1.6rem",
          },
          "& .MuiDataGrid-menuIcon .MuiSvgIcon-root": {
            color: "#f2f2f2",
            fontSize: "1.6rem",
          },
          "& .MuiDataGrid-editInputCell": {
            fontSize: "1.6rem",
          },
          "& .MuiDataGrid-cell .MuiSvgIcon-root": {
            fontSize: "2.6rem",
            color: "#23404F",
          },
          "& .Mui-error": {
            border: "solid 3px red !important",
            borderRadius: "0px",
            outlineColor: "red",
          },
          "& .MuiDataGrid-row": {
            maxHeight: "fit-content !important",
          },
          "& .MuiDataGrid-row.your-request-row": {
            maxHeight: "fit-content !important",
            backgroundColor: "#A5D8F6 !important",
          },
          "& .MuiDataGrid-row.do-not-ship-style": {
            maxHeight: "fit-content !important",
            backgroundColor: "#EF2929",
            border: "solid #EF2929 2px",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none !important",
          },
          "& .MuiDataGrid-overlay": {
            fontSize: "1.6rem",
          },
        }}
      />
    </Box>
  );
};

interface DialogProps {
  children?: ReactNode;
  title?: string;
}

export function MyDialog(props: {
  props: DialogProps;
  open: boolean;
  handleClick?: (e?: unknown) => void;
  handleClose: () => void;
  label?: string;
  variant?: ButtonProps["variant"];
  form?: boolean;
  formValid?: boolean;
  handleSave?: () => void;
  openForm?: boolean;
  setOpenForm?: Dispatch<SetStateAction<boolean>>;
  advancedSearch?: boolean;
  import?: boolean;
  size?: false | Breakpoint;
  handleKeyDown?: (e?: unknown) => void;
}) {
  const { children, title } = props.props;
  const actionButtonLabel = () => {
    if (props.advancedSearch) {
      return "Search";
    } else if (props.import) {
      return "Upload";
    } else {
      return "Save";
    }
  };
  return (
    <>
      <Button
        className="button-light"
        variant={props.variant ?? "outlined"}
        onClick={props.handleClick}
        sx={{ height: "5rem", alignSelf: "center" }}
      >
        {props.label ?? title}
      </Button>
      <Dialog
        maxWidth={props.size ?? "sm"}
        fullWidth
        open={(props.open || props.openForm) ?? false}
        sx={{ overflowY: "scroll" }}
        onKeyDown={props.handleKeyDown}
      >
        <DialogTitle
          sx={{
            // padding: "1rem",
            fontWeight: "800 !important",
            display: "flex",
          }}
        >
          {title}
          <Box
            sx={{ display: "flex", flexGrow: "1", justifyContent: "flex-end" }}
          >
            <IconButton
              className="dialog-close-btn"
              onClick={props.handleClose}
            >
              <Close sx={{ fontSize: "2rem" }} />
            </IconButton>
          </Box>
        </DialogTitle>
        {children}
        {props.form || props.advancedSearch || props.import ? (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Button
              disabled={props.form && !props.formValid}
              sx={{ margin: "1rem 2rem" }}
              variant="outlined"
              className="button-dark"
              onClick={() => {
                props.handleSave?.();
                // await props.handleClose();
              }}
            >
              {actionButtonLabel()}
            </Button>
            <Button
              variant="outlined"
              sx={{ margin: "1rem 2rem" }}
              className="button-light"
              onClick={props.handleClose}
            >
              Close
            </Button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button
                variant="outlined"
                sx={{ margin: "1rem 2rem" }}
                className="button-light"
                onClick={props.handleClose}
              >
                Close
              </Button>
            </div>
          </>
        )}
      </Dialog>
    </>
  );
}

export function MyDialogNoButton(props: {
  props: DialogProps;
  open: boolean;
  handleClose: () => void;
  label?: string;
  variant?: ButtonProps["variant"];
  form?: boolean;
  formValid?: boolean;
  handleSave?: () => void;
  openForm?: boolean;
  setOpenForm?: Dispatch<SetStateAction<boolean>>;
  advancedSearch?: boolean;
  size?: false | Breakpoint;
  okayDialog?: boolean;
  height?: number;
  customButtonLabel?: string;
  customSaveLabel?: string;
  customCloseLabel?: string;
}) {
  const { children, title } = props.props;

  return (
    <>
      <Dialog
        fullWidth
        open={(props.open || props.openForm) ?? false}
        onClose={props.handleClose}
        maxWidth={props.size ?? "sm"}
        // PaperProps={{
        //   sx: {
        //     height: props.height,
        //     display: "flex",
        //   },
        // }}
      >
        <DialogTitle
          sx={{
            padding: "1rem",
            fontWeight: "800 !important",
            fontSize: "2rem !important",
          }}
        >
          {title}
        </DialogTitle>
        {children}
        {props.form || props.advancedSearch ? (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Button
              disabled={props.form && !props.formValid}
              sx={{ margin: "1rem 2rem" }}
              variant="outlined"
              className="button-dark"
              onClick={() => {
                props.handleSave?.();
                props.handleClose();
              }}
            >
              {props.advancedSearch
                ? "Search"
                : (props.customSaveLabel ?? "Save")}
            </Button>
            <Button
              variant="outlined"
              sx={{ margin: "1rem 2rem" }}
              className="button-light"
              onClick={props.handleClose}
            >
              {props.customCloseLabel ?? "Close"}
            </Button>
          </div>
        ) : (
          <></>
        )}
        {props.okayDialog ? (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Button
              variant="outlined"
              sx={{ margin: "1rem 2rem" }}
              className="button-light"
              onClick={props.handleClose}
            >
              {props.customButtonLabel ?? "Okay"}
            </Button>
          </div>
        ) : (
          <></>
        )}
      </Dialog>
    </>
  );
}

export function HintBox(props: {
  hint: string;
  title?: string;
  className?: string;
  appendAfter?: ReactNode;
  appendBefore?: ReactNode;
}) {
  return (
    <Box
      sx={{
        backgroundColor: "#E9E9E4",
        display: "flex",
        alignItems: "center",
        flexDirection: "row",
        padding: "1rem",
        maxWidth: props.className === "dialog-field-width" ? "450px" : null,
      }}
    >
      <LightbulbOutlined sx={{ color: "#BF4D00", fontSize: "2.6rem" }} />
      <span>
        <Typography fontSize={"1.2rem"} color={"red"} fontWeight={700}>
          {props.title}
        </Typography>
        {props.appendBefore ? props.appendBefore : <></>}
        <Typography fontSize={"1.2rem"} color={"black"}>
          {props.hint}
        </Typography>
        {props.appendAfter ? props.appendAfter : <></>}
      </span>
    </Box>
  );
}

export function AcknowledgmentAlert(props: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  requireConfirmation: boolean;
}) {
  const [checked, setChecked] = useState(false);

  const handleClose = () => {
    props.onClose();
    setChecked(false);
  };

  const handleConfirm = () => {
    if (!props.requireConfirmation || checked) {
      props.onConfirm();
      handleClose();
    }
  };

  return (
    <Dialog open={props.open}>
      <DialogTitle sx={{ fontSize: "2.6rem", fontWeight: "700" }}>
        {props.title}
      </DialogTitle>
      <DialogContent className="body1">{props.message}</DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          className="button-light"
          onClick={handleClose}
        >
          No
        </Button>
        <Button
          variant="outlined"
          className="button-dark"
          onClick={handleConfirm}
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function WarningAlert(props: {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  customLabel?: string;
}) {
  const handleClose = () => {
    props.onClose();
  };

  return (
    <Dialog open={props.open}>
      <DialogTitle sx={{ fontSize: "2.6rem", fontWeight: "700" }}>
        {props.title}
      </DialogTitle>
      <DialogContent className="body1">{props.message}</DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          className="button-dark"
          onClick={handleClose}
        >
          {props.customLabel ?? "OK"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function CustomToolbar(props: {
  readOnlyData: any[];
  buttons: any[];
  smallButtons?: boolean;
  isCustomComponent?: boolean;
  data?: any;
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  return (
    <AppBar className="appbar" position="static">
      <Toolbar sx={{ flexWrap: "wrap" }} disableGutters>
        {props.readOnlyData.map((rd) => {
          return (
            <div key={"appbar-item-" + rd.title} className="appbar__items">
              <Typography className="body1 appbar__item-title">
                {rd.title}
              </Typography>
              <Typography variant="h6" className="body1 appbar__item-content">
                {rd.value === null ? "N/A" : (rd.value as string)}
              </Typography>
            </div>
          );
        })}
        <div className="appbar__tools">
          {props.buttons.map((btn) => {
            if (btn.isMenu) {
              return (
                <div style={{ display: "flex" }}>
                  <Button
                    key={"appbar-btn-" + btn.name}
                    onClick={btn.handleClick}
                    variant="outlined"
                    className={
                      props.smallButtons
                        ? "button-light-small tool-button"
                        : "button-light tool-button"
                    }
                    disabled={btn.disabled ?? false}
                  >
                    {btn.name}
                  </Button>
                  <Menu
                    open={Boolean(btn.anchorEl)}
                    onClose={() => btn.setAnchorEl?.(null)}
                    anchorEl={btn.anchorEl}
                  >
                    {btn.menuItems?.map((item) => (
                      <MenuItem onClick={item.handleClick}>
                        {item.title}
                      </MenuItem>
                    ))}
                  </Menu>
                </div>
              );
            } else if (!btn.isCustomComponent) {
              return (
                <Button
                  key={"appbar-btn-" + btn.name}
                  onClick={btn.handleClick}
                  variant="outlined"
                  className={
                    props.smallButtons
                      ? "button-light-small tool-button"
                      : "button-light tool-button"
                  }
                  disabled={btn.disabled ?? false}
                >
                  {btn.name}
                </Button>
              );
            } else {
              return <PrintLabelMenu isComponent={true} />;
            }
          })}
        </div>
      </Toolbar>
    </AppBar>
  );
}

export function ValidationDrawer(props: {
  title: string;
  open: boolean;
  onClose: () => void;
  onOpen?: () => void;
  messages?: string[];
}) {
  return (
    <Drawer open={props.open} onClose={props.onClose} title={props.title}>
      <Typography className="title" margin={"2rem"}>
        {props.title}
      </Typography>
      <Box sx={{ margin: "2rem" }}>
        {props.messages?.length && props.messages.length > 0 ? (
          <ul>
            {props.messages?.map((msg) => (
              <li className="body1-dark list">{msg ? msg : "None"}</li>
            ))}
          </ul>
        ) : (
          <Typography className="body1-dark">No Errors</Typography>
        )}
      </Box>
    </Drawer>
  );
}

export function HoverHint(props: { hintMessage: string }) {
  return (
    <Tooltip title={props.hintMessage}>
      <IconButton>
        <HelpOutline />
      </IconButton>
    </Tooltip>
  );
}

export const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    color: "rgba(0,0,0,0.87)",
    fontSize: "1.2rem",
    backgroundColor: "#eeeeee",
    whiteSpace: "pre-line",
  },
}));
