/**
 * SitePanelContent Component
 * Site exploration panel content (without frame/action bar)
 * Ported from OriginalGame/src/ui/siteNode.js
 * 
 * This is the content-only component that goes inside BottomSection.
 * BottomSection handles the frame/layout and action bar (title, progress, item count).
 * This component handles the site image, description, and buttons.
 */

import { useEffect } from 'react'
import { Site } from '@/core/game/world/Site'
import { Sprite } from '@/common/ui/sprite/Sprite'
import { cocosToCssY } from '@/common/utils/position'
import { BOTTOM_BAR_LAYOUT } from '@/layout/layoutConstants'
import { SiteButton } from './LocationButton'
import { calculateSiteButtonPositions } from './siteUtils'
import { getString } from '@/common/utils/stringUtil'
import { saveAll } from '@/core/game/systems/SaveSystem'

interface SitePanelContentProps {
  site: Site
  onStorageClick?: () => void
  onExploreClick?: () => void
  onGachaponClick?: () => void
  onHotelClick?: () => void
}

export function SitePanelContent({ 
  site, 
  onStorageClick, 
  onExploreClick,
  onGachaponClick,
  onHotelClick
}: SitePanelContentProps) {
  const { bgWidth, leftEdge, rightEdge, cocosRef, content } = BOTTOM_BAR_LAYOUT
  const contentHeight = content.height
  
  // Save game when entering location panel
  useEffect(() => {
    saveAll().catch(err => console.error('Auto-save failed when entering location panel:', err))
  }, [site.id])
  
  // dig_des: (bgRect.width / 2, contentTopLineHeight - 50) with anchor (0.5, 1)
  // Position relative to content area (not full bgHeight)
  const digDesY = cocosToCssY(cocosRef.contentTopLineHeight - 75 - content.top, contentHeight)
  
  // des: below dig image
  const estimatedDigDesHeight = 200
  const desY = digDesY + estimatedDigDesHeight + 20
  
  // Buttons at bottom
  // btn1: (bgRect.width / 4, 100) for normal sites, (bgRect.width / 6, 100) for bazaar
  // btn2: (bgRect.width / 4 * 3, 100) for normal sites, (bgRect.width / 6 * 5, 100) for bazaar
  const isBazaar = site.id === 400
  const { btn1X, btn2X } = calculateSiteButtonPositions(bgWidth, isBazaar)
  const btnY = cocosToCssY(cocosRef.buttonRowY, contentHeight)
  
  const siteDes = site.getDes()
  const isSiteEnd = site.isSiteEnd()
  
  return (
    <div className="relative w-full h-full">
      {/* Site dig image (dig_des) */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: `${digDesY}px`,
          transform: 'translate(-50%, -50%)',
        }}
        data-test-id="sitepanel-dig-image"
        data-test-label="Site Dig Image"
        data-test-position
      >
        <Sprite
          atlas="site"
          frame={`site_dig_${site.id}.png`}
          style={{ maxWidth: '550px', maxHeight: '300px' }}
        />
      </div>
      
      {/* Description text (des) */}
      <div
        className="absolute text-white text-center"
        style={{
          left: '50%',
          top: `${desY - 80}px`,
          width: `${rightEdge - leftEdge}px`,
          transform: 'translateX(-50%)',
          fontSize: '18px',
          fontFamily: "'Noto Sans', sans-serif",
          lineHeight: '1.4',
        }}
        data-test-id="sitepanel-description"
        data-test-label="Site Description"
        data-test-position
      >
        {siteDes}
      </div>
      
      {/* Storage button (btn1) */}
      <SiteButton
        text={getString(1032) || 'Depository'}  // "Depository"
        onClick={onStorageClick}
        showNotification={site.haveNewItems}
        position={{ x: btn1X, y: btnY - 100 }}
        testId="sitepanel-storage-btn"
        testLabel="Storage Button"
      />
      
      {/* Explore button (btn2) */}
      <SiteButton
        text={getString(1033) || 'Enter'}  // "Enter"
        onClick={onExploreClick}
        disabled={isSiteEnd}
        position={{ x: btn2X, y: btnY - 100 }}
        testId="sitepanel-explore-btn"
        testLabel="Explore Button"
      />
      
      {/* Bazaar-specific buttons (if site.id === 400) */}
      {isBazaar && (
        <>
          {/* Gachapon button (btn3) */}
          <SiteButton
            text="Gachapon"
            onClick={onGachaponClick}
            position={{ x: bgWidth / 2, y: btnY - 100 }}
            testId="sitepanel-gachapon-btn"
            testLabel="Gachapon Button"
          />
          
          {/* Hotel button (btn4) */}
          <SiteButton
            text="Hotel"
            onClick={onHotelClick}
            position={{ x: bgWidth / 2, y: btnY - 100 + 70 }}
            testId="sitepanel-hotel-btn"
            testLabel="Hotel Button"
          />
        </>
      )}
    </div>
  )
}

/**
 * Helper to get BottomSection props for a site
 * Use this when composing BottomSection + SitePanelContent
 */
export function getSiteBottomBarProps(site: Site) {
  return {
    title: site.getName(),
    leftSubtext: `Progress: ${site.getProgressStr(0, site.id)}`,
    rightSubtext: `Items: ${site.getAllItemNum()}`,
  }
}

