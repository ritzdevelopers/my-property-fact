import PropertyV3 from "./propertypageV3";
import ProjectHeroLcpPreload from "./ProjectHeroLcpPreload";
import {
  buildProjectHeroLcpProps,
  getProjectHeroSlides,
} from "@/lib/optimizedImage";

export default function PropertyServer(props) {
  const { projectDetail } = props;
  const heroSlides = getProjectHeroSlides(projectDetail);
  const heroPrimaryLcp = buildProjectHeroLcpProps(
    heroSlides[0],
    projectDetail?.projectName,
  );

  return (
    <>
      <ProjectHeroLcpPreload projectDetail={projectDetail} />
      <PropertyV3
        {...props}
        heroSlides={heroSlides}
        heroPrimaryLcp={heroPrimaryLcp}
      />
    </>
  );
}
