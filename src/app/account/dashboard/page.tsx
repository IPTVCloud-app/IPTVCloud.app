import { OverviewHeader } from "@/components/dashboard/OverviewHeader";
import { ActivitySnapshot } from "@/components/dashboard/ActivitySnapshot";
import { ContinueWatching } from "@/components/dashboard/ContinueWatching";
import { SmartRecommendations } from "@/components/dashboard/SmartRecommendations";
import { ChannelLibrary } from "@/components/dashboard/ChannelLibrary";
import { DeviceControl } from "@/components/dashboard/DeviceControl";
import { WatchHistory } from "@/components/dashboard/WatchHistory";
import { Notifications } from "@/components/dashboard/Notifications";
import { ProfileInsightLayer } from "@/components/dashboard/ProfileInsightLayer";

export const metadata = {
  title: "Dashboard - IPTVCloud",
};

export default function AccountDashboardPage() {
  return (
    <div className="w-full pb-24">
      {/* 1. Header & Overview Stats */}
      <OverviewHeader />
      
      {/* 2. Personal Activity Snapshot */}
      <ActivitySnapshot />
      
      {/* 3. Continue Watching */}
      <ContinueWatching />
      
      {/* 4. Smart Recommendations */}
      <SmartRecommendations />
      
      {/* 5. Profile-Controlled Channel Library */}
      <ChannelLibrary />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          {/* 6. Device & Session Control */}
          <DeviceControl />
          
          {/* 8. Notifications */}
          <Notifications />
        </div>
        
        <div>
          {/* 7. Watch History Timeline */}
          <WatchHistory />
        </div>
      </div>

      {/* 10. Profile Insight Layer (Gamified) */}
      <ProfileInsightLayer />
    </div>
  );
}