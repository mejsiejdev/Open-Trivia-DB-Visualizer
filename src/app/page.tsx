import { Spinner } from "@/components/ui/spinner";
import { Charts } from "@/app/charts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowUpRight } from "lucide-react";
import { ThemeSwitch } from "@/components/theme-switch";

export default async function Home() {
  const res = await fetch("https://opentdb.com/api.php?amount=50");
  const json = await res.json();
  const data = json.results;

  return (
    <div className="font-sans flex flex-col items-center justify-center min-h-screen p-4 sm:p-8">
      <main className="w-full container flex flex-col items-start gap-4">
        <div className="px-4 flex flex-col gap-2 w-full">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 w-full">
            <h1 className="text-4xl font-bold">Open Trivia DB Visualizer</h1>
            <div className="flex flex-row items-center w-full lg:w-auto justify-between lg:justify-start gap-4">
              <p className="flex flex-col sm:flex-row sm:items-center gap-2 sm:text-left">
                Made by{" "}
                <a
                  rel="noreferrer noopener"
                  href="https://github.com/mejsiejdev"
                  target="_blank"
                  className="inline-flex items-center transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400 rounded-full px-2 py-1 hover:bg-blue-500/10 dark:hover:bg-blue-400/10"
                >
                  <Avatar className="mr-2">
                    <AvatarImage
                      src="https://avatars.githubusercontent.com/u/105872023?v=4"
                      alt="mejsiejdev avatar"
                    />
                    <AvatarFallback>MM</AvatarFallback>
                  </Avatar>
                  <span className="whitespace-nowrap text-sm">
                    Maciej Malinowski <br className="inline sm:hidden" />{" "}
                    (@mejsiejdev)
                  </span>
                  <ArrowUpRight className="w-5 h-5 ml-1 hidden sm:inline" />
                </a>
              </p>
              <div className="mt-2 sm:mt-0">
                <ThemeSwitch />
              </div>
            </div>
          </div>
        </div>
        {!data ? (
          <div className="text-lg flex flex-row items-center gap-2">
            <Spinner /> Loading data from the API, if this takes too long,
            please try refreshing the page.
          </div>
        ) : (
          <Charts data={data} />
        )}
      </main>
    </div>
  );
}
