/**
 * SitePanelContent Component
 * Site exploration panel content (without frame/action bar)
 * Ported from OriginalGame/src/ui/siteNode.js
 * 
 * This is the content-only component that goes inside BottomBar.
 * BottomBar handles the frame/layout and action bar (title, progress, item count).
 * This component handles the site image, description, and buttons.
 */

import { Site } from '@/game/world/Site'
import { Sprite } from '@/components/sprites/Sprite'
import { cocosToCssY } from '@/utils/position'
import { BOTTOM_BAR_LAYOUT } from '@/components/layout/layoutConstants'

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
  
  // dig_des: (bgRect.width / 2, contentTopLineHeight - 50) with anchor (0.5, 1)
  // Position relative to content area (not full bgHeight)
  const digDesY = cocosToCssY(cocosRef.contentTopLineHeight - 50 - content.top, contentHeight)
  
  // des: below dig image
  const estimatedDigDesHeight = 200
  const desY = digDesY + estimatedDigDesHeight + 20
  
  // Buttons at bottom
  // btn1: (bgRect.width / 4, 100) for normal sites, (bgRect.width / 6, 100) for bazaar
  // btn2: (bgRect.width / 4 * 3, 100) for normal sites, (bgRect.width / 6 * 5, 100) for bazaar
  const isBazaar = site.id === 400
  const btn1X = isBazaar ? bgWidth / 6 : bgWidth / 4
  const btn2X = isBazaar ? bgWidth / 6 * 5 : bgWidth / 4 * 3
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
          style={{ maxWidth: '400px', maxHeight: '300px' }}
        />
      </div>
      
      {/* Description text (des) */}
      <div
        className="absolute text-white text-center"
        style={{
          left: '50%',
          top: `${desY - 100}px`,
          width: `${rightEdge - leftEdge}px`,
          transform: 'translateX(-50%)',
          fontSize: '14px',
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
      <button
        onClick={onStorageClick}
        className="absolute"
        style={{
          left: `${btn1X}px`,
          top: `${btnY -100}px`,
          transform: 'translate(-50%, 0)',
          width: '120px',
          height: '50px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
        data-test-id="sitepanel-storage-btn"
        data-test-label="Storage Button"
        data-test-position
      >
        <Sprite atlas="ui" frame="btn_common_white_normal.png" className="w-full h-full" />
        <div className="absolute inset-0 flex items-center justify-center text-black text-sm font-bold">
          Depository
        </div>
        {/* Notification icon if haveNewItems */}
        {site.haveNewItems && (
          <div
            className="absolute"
            style={{
              right: '5px',
              top: '5px',
              width: '20px',
              height: '20px',
            }}
          >
            <Sprite atlas="gate" frame="map_actor.png" className="w-full h-full" />
          </div>
        )}
      </button>
      
      {/* Explore button (btn2) */}
      <button
        onClick={onExploreClick}
        disabled={isSiteEnd}
        className="absolute"
        style={{
          left: `${btn2X}px`,
          top: `${btnY - 100}px`,
          transform: 'translate(-50%, 0)',
          width: '120px',
          height: '50px',
          background: 'transparent',
          border: 'none',
          cursor: isSiteEnd ? 'not-allowed' : 'pointer',
          opacity: isSiteEnd ? 0.5 : 1,
        }}
        data-test-id="sitepanel-explore-btn"
        data-test-label="Explore Button"
        data-test-position
      >
        <Sprite 
          atlas="ui" 
          frame="btn_common_white_normal.png" 
          className="w-full h-full" 
        />
        <div className="absolute inset-0 flex items-center justify-center text-black text-sm font-bold">
          Enter
        </div>
      </button>
      
      {/* Bazaar-specific buttons (if site.id === 400) */}
      {isBazaar && (
        <>
          {/* Gachapon button (btn3) */}
          <button
            onClick={onGachaponClick}
            className="absolute"
            style={{
              left: '50%',
              top: `${btnY - 100}px`,
              transform: 'translate(-50%, 0)',
              width: '120px',
              height: '50px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            data-test-id="sitepanel-gachapon-btn"
            data-test-label="Gachapon Button"
            data-test-position
          >
            <Sprite atlas="ui" frame="btn_common_white_normal.png" className="w-full h-full" />
            <div className="absolute inset-0 flex items-center justify-center text-black text-sm font-bold">
              Gachapon
            </div>
          </button>
          
          {/* Hotel button (btn4) */}
          <button
            onClick={onHotelClick}
            className="absolute"
            style={{
              left: '50%',
              top: `${btnY - 100 + 70}px`,
              transform: 'translate(-50%, 0)',
              width: '120px',
              height: '50px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            data-test-id="sitepanel-hotel-btn"
            data-test-label="Hotel Button"
            data-test-position
          >
            <Sprite atlas="ui" frame="btn_common_white_normal.png" className="w-full h-full" />
            <div className="absolute inset-0 flex items-center justify-center text-black text-sm font-bold">
              Hotel
            </div>
          </button>
        </>
      )}
    </div>
  )
}

/**
 * Helper to get BottomBar props for a site
 * Use this when composing BottomBar + SitePanelContent
 */
export function getSiteBottomBarProps(site: Site) {
  return {
    title: site.getName(),
    leftSubtext: `Progress: ${site.getProgressStr(0, site.id)}`,
    rightSubtext: `Items: ${site.getAllItemNum()}`,
  }
}

