import React from 'react';

const LOGO_ICON = "https://res.cloudinary.com/dgt5d9xfq/image/upload/v1771380642/logo_compacta_sem_fundo_q97itc.png";
const LOGO_SIMPLE = "https://res.cloudinary.com/dgt5d9xfq/image/upload/v1771271358/CondoLeve_logo_sem_slogan_skb3zu.png";
const LOGO_FULL = "https://res.cloudinary.com/dgt5d9xfq/image/upload/v1771267774/CondoLeve_logo_com_slogan_qfgedb.png";

export const Logo = ({ className = "", variant = "simple", width }) => {
    let src = LOGO_SIMPLE;
    let defaultWidth = "w-32";
    if (variant === 'icon') { src = LOGO_ICON; defaultWidth = "w-10"; } 
    else if (variant === 'full') { src = LOGO_FULL; defaultWidth = "w-48"; }
    return <img src={src} alt="CondoLeve" className={`object-contain ${width || defaultWidth} ${className}`} />;
};
