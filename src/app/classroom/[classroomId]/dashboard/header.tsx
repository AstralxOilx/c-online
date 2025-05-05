
interface HeaderProps {
    title: string;
}
export const Header = ({ title }: HeaderProps) => { 
    return (
        <> 
            <div className="bg-secondary/50 h-[45px] flex items-center px-4 overflow-hidden">
                 {title}
            </div>
        </>
    );

}