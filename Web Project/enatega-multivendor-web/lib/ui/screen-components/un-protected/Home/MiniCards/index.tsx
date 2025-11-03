import HomeMiniCard from '@/lib/ui/useable-components/Home-miniCard'
import { useTranslations } from 'next-intl'
import React from 'react'

const MiniCards:React.FC = () => {
  const t = useTranslations();
  return (
    <div>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-sols-4 gap-8 mt-[30px] mb-[30px]'>
<HomeMiniCard image={"/assets/images/png/Homepage/Minicard/drone-delivery-3d-icon-object-png.png"} heading={t('MiniCardsHomeScreen.title1')} subText={t('MiniCardsHomeScreen.subText1')} backColor={"#FFF8E1"} darkBackColor={"#4A3C1E"} headingColor={"#D4AF37"}/> 
<HomeMiniCard image={"/assets/images/png/Homepage/Minicard/drone-delivery-3d-ship.png"} heading={t('MiniCardsHomeScreen.title2')} subText={t('MiniCardsHomeScreen.subText2')} backColor={"#E8F5E9"} darkBackColor={"#1B3E22"} headingColor={"#4CAF50"}/> 
<HomeMiniCard image={"/assets/images/png/Homepage/Minicard/drone-delivery-3d-with-customer.png"} heading={t('MiniCardsHomeScreen.title3')} subText={t('MiniCardsHomeScreen.subText3')} backColor={"#FBE9E7"} darkBackColor={"#4A2E2A"} headingColor={"#FF7043"}/> 
<HomeMiniCard image={"/assets/images/png/Homepage/Minicard/drone-delivery-3d-food-and-drone.png"} heading={t('MiniCardsHomeScreen.title4')} subText={t('MiniCardsHomeScreen.subText4')} backColor={"#E0F2F7"} darkBackColor={"#1A363F"} headingColor={"#29B6F6"}/> 
</div>
    </div>
  )
}

export default MiniCards
