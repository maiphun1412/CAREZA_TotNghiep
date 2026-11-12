"use client";

import React from "react";
import { ResumeData } from "../../types";
import { PaginatedPageData } from "../../utils/pagination";
import { ModernTwoColumnTemplate } from "./modern-two-column";
import { ClassicExecutiveTemplate } from "./classic-executive";
import { MinimalistCleanTemplate } from "./minimalist-clean";
import { CreativeTimelineTemplate } from "./creative-timeline";
import { CompactDenseTemplate } from "./compact-dense";
import { InfographicBoldTemplate } from "./infographic-bold";

export interface TemplateProps {
  data: ResumeData;
  pageData?: PaginatedPageData;
  onUpdatePersonalInfo: (field: keyof ResumeData["personalInfo"], val: string) => void;
  onUpdateExperience: (id: string, updates: any) => void;
  onUpdateEducation: (id: string, updates: any) => void;
  onUpdateSkill: (id: string, updates: any) => void;
  onUpdateProject: (id: string, updates: any) => void;
  onUpdateCertificate: (id: string, updates: any) => void;
}

export function TemplateRenderer(props: TemplateProps) {
  const { data } = props;
  const templateId = data.theme.templateId;

  switch (templateId) {
    case "classic-executive":
      return <ClassicExecutiveTemplate {...props} />;
    case "minimalist-clean":
      return <MinimalistCleanTemplate {...props} />;
    case "creative-timeline":
      return <CreativeTimelineTemplate {...props} />;
    case "compact-dense":
      return <CompactDenseTemplate {...props} />;
    case "infographic-bold":
      return <InfographicBoldTemplate {...props} />;
    case "modern-two-column":
    default:
      return <ModernTwoColumnTemplate {...props} />;
  }
}
