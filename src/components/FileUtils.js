import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

export const downloadFile = async (url, fileName) => {
  try {
    // Validate inputs
    // if (!url || !fileName) {
    //   throw new Error("Invalid URL or filename");
    // }
    console.log(url, "dfile");
    // Platform-specific configuration
    const platform = Capacitor.getPlatform();
    const directory =
      platform === "android" ? Directory.Downloads : Directory.Documents;

    // Android permission handling
    if (platform === "android") {
      await Filesystem.requestPermissions();
    }

    // Perform the download
    const result = await Filesystem.downloadFile({
      url: url,
      path: fileName,
      directory: directory,
      // Remove any non-standard parameters
    });

    // iOS file sharing
    if (platform === "ios") {
      const fileUri = await Filesystem.getUri({
        path: fileName,
        directory: directory,
      });

      await Share.share({
        title: "Save File",
        url: fileUri.uri,
        dialogTitle: "Choose save location",
      });
    }

    return {
      success: true,
      path: result.path,
      error: null,
    };
  } catch (error) {
    console.error("Download error:", error);
    return {
      success: false,
      path: null,
      error: error.message,
    };
  }
};
