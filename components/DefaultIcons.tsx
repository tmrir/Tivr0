import React from 'react';
import { User, Briefcase, Image as ImageIcon, FileText, Camera, Building, Code, Palette, TrendingUp, Shield, Zap, Globe, MessageCircle, Heart, Star, ArrowRight } from 'lucide-react';

// أيقونات افتراضية للخدمات
export const ServiceIcons = {
  HelpCircle: (props: any) => <HelpCircle {...props} />,
  Code: (props: any) => <Code {...props} />,
  Palette: (props: any) => <Palette {...props} />,
  TrendingUp: (props: any) => <TrendingUp {...props} />,
  Shield: (props: any) => <Shield {...props} />,
  Zap: (props: any) => <Zap {...props} />,
  Globe: (props: any) => <Globe {...props} />,
  MessageCircle: (props: any) => <MessageCircle {...props} />,
  Building: (props: any) => <Building {...props} />,
  Camera: (props: any) => <Camera {...props} />,
};

// أيقونة افتراضية لأعضاء الفريق
export const DefaultTeamAvatar = ({ size = 96, className = '' }: { size?: number; className?: string }) => (
  <div 
    className={`bg-gradient-to-br from-tivro-primary to-tivro-dark rounded-full flex items-center justify-center text-white ${className}`}
    style={{ width: size, height: size }}
  >
    <User size={size * 0.4} />
  </div>
);

// أيقونة افتراضية للـ Case Studies
export const DefaultCaseStudyImage = ({ className = '' }: { className?: string }) => (
  <div className={`bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center text-slate-400 ${className}`}>
    <Briefcase size={48} />
  </div>
);

// أيقونة افتراضية للـ Blog Posts
export const DefaultBlogImage = ({ className = '' }: { className?: string }) => (
  <div className={`bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center text-slate-400 ${className}`}>
    <FileText size={48} />
  </div>
);

// أيقونة افتراضية للـ Services
export const DefaultServiceIcon = ({ iconName = 'HelpCircle', size = 48, className = '' }: { 
  iconName?: keyof typeof ServiceIcons; 
  size?: number; 
  className?: string 
}) => {
  const IconComponent = ServiceIcons[iconName] || ServiceIcons.HelpCircle;
  return (
    <div className={`bg-gradient-to-br from-tivro-primary/10 to-tivro-dark/10 rounded-lg flex items-center justify-center text-tivro-primary ${className}`}>
      <IconComponent size={size} />
    </div>
  );
};

// صورة افتراضية مع نص للحالات التي لا يوجد فيها صورة
export const DefaultImageWithText = ({ 
  text, 
  size = 96, 
  className = '',
  bgColor = 'from-slate-100 to-slate-200',
  textColor = 'text-slate-400'
}: { 
  text: string; 
  size?: number; 
  className?: string;
  bgColor?: string;
  textColor?: string;
}) => {
  const firstLetter = text.charAt(0).toUpperCase();
  return (
    <div 
      className={`bg-gradient-to-br ${bgColor} rounded-full flex items-center justify-center ${textColor} font-bold ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {firstLetter}
    </div>
  );
};

// صورة افتراضية للـ Logo
export const DefaultLogo = ({ width = 120, height = 40, className = '' }: { 
  width?: number; 
  height?: number; 
  className?: string 
}) => (
  <div className={`bg-gradient-to-r from-tivro-primary to-tivro-dark rounded-lg flex items-center justify-center text-white font-bold ${className}`}
       style={{ width, height }}
  >
    <span style={{ fontSize: height * 0.5 }}>T</span>
  </div>
);

// صورة افتراضية للـ Favicon
export const DefaultFavicon = ({ size = 32, className = '' }: { size?: number; className?: string }) => (
  <div 
    className={`bg-gradient-to-br from-tivro-primary to-tivro-dark rounded flex items-center justify-center text-white font-bold ${className}`}
    style={{ width: size, height: size }}
  >
    <span style={{ fontSize: size * 0.6 }}>T</span>
  </div>
);

// صورة افتراضية للـ Banner
export const DefaultBannerImage = ({ className = '' }: { className?: string }) => (
  <div className={`bg-gradient-to-r from-tivro-primary via-tivro-primary/80 to-tivro-dark rounded-lg flex items-center justify-center text-white ${className}`}>
    <div className="text-center p-8">
      <ImageIcon size={48} className="mx-auto mb-4" />
      <p className="text-lg font-semibold">Default Banner</p>
    </div>
  </div>
);

// مكون مساعد لعرض الصورة مع fallback
export const ImageWithFallback = ({ 
  src, 
  alt, 
  fallback: FallbackComponent, 
  className = '',
  ...props 
}: { 
  src?: string; 
  alt: string; 
  fallback: React.ComponentType<any>; 
  className?: string;
  [key: string]: any;
}) => {
  const [hasError, setHasError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  if (hasError || !src) {
    return <FallbackComponent className={className} {...props} />;
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-slate-100 animate-pulse rounded-lg" />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        {...props}
      />
    </div>
  );
};
