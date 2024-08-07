import { Avatar, Box, Fade, Grid, Hidden, makeStyles, styled, Tooltip, Typography, useMediaQuery, useTheme, Zoom } from "@material-ui/core";
import clsx from "clsx";
import { useRef } from "react";
import * as icons from "simple-icons";
import data from "../data.json";
import useAnimate from "./useAnimate";
import { getDescendantProp, iconify } from "./util";
import Spline from "@splinetool/react-spline";
import { useSplinesStore } from "./stores/useSplinesStore";
interface Skills {
  [key: string]: any[];
}

const SplineWrapper = styled(Box)(({ mdDown }: { mdDown: boolean }) => ({
  width: "100vw",
  height: "100vh",
  position: "absolute",
  "z-index": "-1",
}));

const skills = data.skills as Skills;

const wrapper = (sk: { [key: string]: any }[] = []) =>
  sk.map((v) => {
    const ic = typeof v === "string" ? getDescendantProp(icons, v) : getDescendantProp(icons, v.icon);

    return {
      alt: v.alt || v || ic.title,
      backgroundColor: v.backgroundColor || `#${ic?.hex || "#333"}`,
      icon: (
        <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" height="100%" width="100%" xmlnsXlink="http://www.w3.org/1999/xlink">
          <title>{ic?.title}</title>
          <path d={ic?.path} fill="white" />
        </svg>
      ),
    };
  });

interface IAnyObject {
  [key: string]: any;
}

let wrappedSkills: IAnyObject = {};

Object.getOwnPropertyNames(skills).forEach((type) => {
  wrappedSkills[type] = wrapper(skills[type]);
});

let iobj: IAnyObject = {};

Object.values(wrappedSkills).forEach((oarr) => {
  oarr.forEach(({ backgroundColor, alt }: { backgroundColor: string; alt: string }) => {
    iobj[iconify(alt)] = { backgroundColor };
  });
});

const useStyles: () => IAnyObject = makeStyles((theme) => ({
  cont: {
    minHeight: `calc(100vh - ${theme.spacing(4)}px)`,
  },
  skobj: {
    marginBottom: theme.spacing(4),
  },
  avatar: {
    height: theme.spacing(7),
    width: theme.spacing(7),
    padding: theme.spacing(1.5),
  },
  ...iobj,
}));

export default function Skills() {
  const classes = useStyles();
  const theme = useTheme();
  const isLight = theme.palette.type === "light";
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const align = isMobile ? "center" : "flex-end";
  const textAlign = isMobile ? "center" : "right";

  type SceneMapNames = "isMobileIsLight" | "isDesktopIsLight" | "isMobileIsDark" | "isDesktopIsDark";

  const animRef = useRef(null);
  const animate = useAnimate(animRef);
  const { setIsSkillsSplineLoading } = useSplinesStore();

  const sceneMap: { [key in SceneMapNames]: string } = {
    isMobileIsLight: "a7IvAvV0aSLwnJTp",
    isDesktopIsLight: "zfy4eNCcOiXQ64Pt",
    isMobileIsDark: "YTC85xKUvVi9Zf0j",
    isDesktopIsDark: "bKCzTqMTtAcCPU6A",
  };

  const currentScene = sceneMap[`is${isMobile ? "Mobile" : "Desktop"}Is${isLight ? "Light" : "Dark"}`];

  return (
    <Grid container justify="center" alignItems="center" spacing={10} className={classes.cont}>
      <SplineWrapper mdDown={isMobile}>
        <Spline
          onLoadStartCapture={() => setIsSkillsSplineLoading(true)}
          onLoad={() => setIsSkillsSplineLoading(false)}
          scene={`https://prod.spline.design/${currentScene}/scene.splinecode`}
        />
      </SplineWrapper>
      <Grid item xs={12} lg={6} ref={animRef}>
        <Typography variant="h2" gutterBottom align="center">
          Skills
        </Typography>
        {/* <Hidden mdDown>
          <Fade in={animate} style={{ transitionDelay: "100ms" }}> */}
        {/* <div>
              <Image alt="Skills" src="/skill.svg" width="575" height="338" />
            </div> */}
        {/* </Fade>
        </Hidden> */}
      </Grid>
      <Grid container item xs={12} lg={6} direction="column" spacing={1} alignItems={align}>
        {Object.getOwnPropertyNames(wrappedSkills).map((title, id) => (
          <Grid item key={id} className={classes.skobj}>
            <Typography variant="h4" align={textAlign} gutterBottom component="p">
              {title}
            </Typography>
            <Grid container item direction="row" spacing={1} justify="center">
              {wrappedSkills[title].map(({ alt, icon }: { alt: string; icon: string }, index: number) => (
                <Grid item key={index}>
                  <Zoom in={animate} style={{ transitionDelay: `${150 * index}ms` }}>
                    <Tooltip title={alt.replace("_", " ")} placement="top">
                      <Avatar variant="rounded" className={clsx([classes.avatar, classes[iconify(alt)]])}>
                        {icon}
                      </Avatar>
                    </Tooltip>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
}
