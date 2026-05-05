package App;

use strict;
use warnings;
use parent 'BaseClass';
use App::Math;
use App::Utils;

sub new {
    my ($class, %args) = @_;
    return bless { %args }, $class;
}

sub run {
    my ($self) = @_;
    my $result = App::Math::add($self->{x}, $self->{y});
    my $formatted = App::Utils::format_result($result);
    $self->_log("Result: $formatted");
    return $result;
}

sub _log {
    my ($self, $msg) = @_;
    print "$msg\n";
}

1;
